'use strict';

const EventEmitter = require('events');
const dgram = require('dgram');

const debug = require('debug');

const Packet = require('./packet');
const tokens = require('./tokens');

const safeishJSON = require('./safeishJSON');

const PORT = 54321;

const ERRORS = {
	'-5001': (method, args, err) => err.message === 'invalid_arg' ? 'Invalid argument' : err.message,
	'-5005': (method, args, err) => err.message === 'params error' ? 'Invalid argument' : err.message,
	'-10000': (method) => 'Method `' + method + '` is not supported'
};


/**
 * Class for keeping track of the current network of devices. This is used to
 * track a few things:
 *
 * 1) Mapping between adresses and device identifiers. Used when connecting to
 * a device directly via IP or hostname.
 *
 * 2) Mapping between id and detailed device info such as the model.
 *
 */
class Network extends EventEmitter {
	constructor() {
		super();

		this.packet = new Packet(true);

		this.addresses = new Map();
		this.devices = new Map();

		this.references = 0;
		this.debug = debug('miio:network');
	}

	search() {
		this.packet.handshake();
		const data = Buffer.from(this.packet.raw);
		this.socket.send(data, 0, data.length, PORT, '255.255.255.255');

		// Broadcast an extra time in 500 milliseconds in case the first brodcast misses a few devices
		setTimeout(() => {
			this.socket.send(data, 0, data.length, PORT, '255.255.255.255');
		}, 500);
	}

	findDevice(id, rinfo) {
		// First step, check if we know about the device based on id
		let device = this.devices.get(id);
		if(! device && rinfo) {
			// If we have info about the address, try to resolve again
			device = this.addresses.get(rinfo.address);

			if(! device) {
				// No device found, keep track of this one
				device = new DeviceInfo(this, id, rinfo.address, rinfo.port);
				this.devices.set(id, device);
				this.addresses.set(rinfo.address, device);

				return device;
			}
		}

		return device;
	}

	findDeviceViaAddress(options) {
		if(! this.socket) {
			throw new Error('Implementation issue: Using network without a reference');
		}

		let device = this.addresses.get(options.address);
		if(! device) {
			// No device was found at the address, try to discover it
			device = new DeviceInfo(this, null, options.address, options.port || PORT);
			this.addresses.set(options.address, device);
		}

		// Update the token if we have one
		if(typeof options.token === 'string') {
			device.token = Buffer.from(options.token, 'hex');
		} else if(options.token instanceof Buffer) {
			device.token = options.token;
		}

		// Set the model if provided
		if(! device.model && options.model) {
			device.model = options.model;
		}

		// Perform a handshake with the device to see if we can connect
		return device.handshake()
			.catch(err => {
				if(err.code === 'missing-token') {
					// Supress missing tokens - enrich should take care of that
					return;
				}

				throw err;
			})
			.then(() => {
				if(! this.devices.has(device.id)) {
					// This is a new device, keep track of it
					this.devices.set(device.id, device);

					return device;
				} else {
					// Sanity, make sure that the device in the map is returned
					return this.devices.get(device.id);
				}
			})
			.then(device => {
				/*
				 * After the handshake, call enrich which will fetch extra
				 * information such as the model. It will also try to check
				 * if the provided token (or the auto-token) works correctly.
				 */
				return device.enrich();
			})
			.then(() => device);
	}

	createSocket() {
		this._socket  = dgram.createSocket('udp4');

		// Bind the socket and when it is ready mark it for broadcasting
		this._socket.bind();
		this._socket.on('listening', () => {
			this._socket.setBroadcast(true);

			const address = this._socket.address();
			this.debug('Network bound to port', address.port);
		});

		// On any incoming message, parse it, update the discovery
		this._socket.on('message', (msg, rinfo) => {
			const buf = Buffer.from(msg);
			try {
				this.packet.raw = buf;
			} catch(ex) {
				this.debug('Could not handle incoming message');
				return;
			}

			if(! this.packet.deviceId) {
				this.debug('No device identifier in incoming packet');
				return;
			}

			const device = this.findDevice(this.packet.deviceId, rinfo);
			device.onMessage(buf);

			if(! this.packet.data) {
				if(! device.enriched) {
					// This is the first time we see this device
					device.enrich()
						.then(() => {
							this.emit('device', device);
						})
						.catch(err => {
							this.emit('device', device);
						});
				} else {
					this.emit('device', device);
				}
			}
		});
	}

	list() {
		return this.devices.values();
	}

	/**
	 * Get a reference to the network. Helps with locking of a socket.
	 */
	ref() {
		this.debug('Grabbing reference to network');
		this.references++;
		this.updateSocket();

		let released = false;
		let self = this;
		return {
			release() {
				if(released) return;

				self.debug('Releasing reference to network');

				released = true;
				self.references--;

				self.updateSocket();
			}
		};
	}

	/**
	 * Update wether the socket is available or not. Instead of always keeping
	 * a socket we track if it is available to allow Node to exit if no
	 * discovery or device is being used.
	 */
	updateSocket() {
		if(this.references === 0) {
			// No more references, kill the socket
			if(this._socket) {
				this.debug('Network no longer active, destroying socket');
				this._socket.close();
				this._socket = null;
			}
		} else if(this.references === 1 && ! this._socket) {
			// This is the first reference, create the socket
			this.debug('Making network active, creating socket');
			this.createSocket();
		}
	}

	get socket() {
		if(! this._socket) {
			throw new Error('Network communication is unavailable, device might be destroyed');
		}

		return this._socket;
	}
}

module.exports = new Network();

class DeviceInfo {
	constructor(parent, id, address, port) {
		this.parent = parent;
		this.packet = new Packet();

		this.address = address;
		this.port = port;

		// Tracker for all promises associated with this device
		this.promises = new Map();
		this.lastId = 0;

		this.id = id;
		this.debug = id ? debug('thing:miio:' + id) : debug('thing:miio:pending');

		// Get if the token has been manually changed
		this.tokenChanged = false;
	}

	get token() {
		return this.packet.token;
	}

	set token(t) {
		this.debug('Using manual token:', t.toString('hex'));
		this.packet.token = t;
		this.tokenChanged = true;
	}

	/**
	 * Enrich this device with detailed information about the model. This will
	 * simply call miIO.info.
	 */
	enrich() {
		if(! this.id) {
			throw new Error('Device has no identifier yet, handshake needed');
		}

		if(this.model && ! this.tokenChanged && this.packet.token) {
			// This device has model info and a valid token
			return Promise.resolve();
		}

		if(this.enrichPromise) {
			// If enrichment is already happening
			return this.enrichPromise;
		}

		// Check if there is a token available, otherwise try to resolve it
		let promise;
		if(! this.packet.token) {
			// No automatic token found - see if we have a stored one
			this.debug('Loading token from storage, device hides token and no token set via options');
			this.autoToken = false;
			promise = tokens.get(this.id)
				.then(token => this.token = Buffer.from(token, 'hex'));
		} else {
			if(this.tokenChanged) {
				this.autoToken = false;
			} else {
				this.autoToken = true;
				this.debug('Using automatic token:', this.packet.token.toString('hex'));
			}
			promise = Promise.resolve();
		}

		return this.enrichPromise = promise
			.then(() => this.call('miIO.info'))
			.then(data => {
				this.enriched = true;
				this.model = data.model;
				this.tokenChanged = false;

				this.enrichPromise = null;
			})
			.catch(err => {
				this.enrichPromise = null;
				this.enriched = true;

				if(err.code === 'missing-token') {
					// Rethrow some errors
					throw err;
				}

				if(this.packet.token) {
					// Could not call the info method, this might be either a timeout or a token problem
					const e = new Error('Could not connect to device, token might be wrong');
					e.code = 'connection-failure';
					e.device = this;
					throw e;
				} else {
					const e = new Error('Could not connect to device, token needs to be specified');
					e.code = 'missing-token';
					e.device = this;
					throw e;
				}
			});
	}

	onMessage(msg) {
		try {
			this.packet.raw = msg;
		} catch(ex) {
			this.debug('<- Unable to parse packet', ex);
			return;
		}

		let data = this.packet.data;
		if(data === null) {
			this.debug('<-', 'Handshake reply:', this.packet.checksum);
			this.packet.handleHandshakeReply();

			if(this.handshakeResolve) {
				this.handshakeResolve();
			}
		} else {
			// Handle null-terminated strings
			if(data[data.length - 1] === 0) {
				data = data.slice(0, data.length - 1);
			}

			// Parse and handle the JSON message
			let str = data.toString('utf8');

			// Remove non-printable characters to help with invalid JSON from devices
			str = str.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ''); // eslint-disable-line

			this.debug('<- Message: `' + str + '`');
			try {
				let object = safeishJSON(str);

				const p = this.promises.get(object.id);
				if(! p) return;
				if(typeof object.result !== 'undefined') {
					p.resolve(object.result);
				} else {
					p.reject(object.error);
				}
			} catch(ex) {
				this.debug('<- Invalid JSON', ex);
			}
		}
	}

	handshake() {
		if(! this.packet.needsHandshake) {
			return Promise.resolve(this.token);
		}

		// If a handshake is already in progress use it
		if(this.handshakePromise) {
			return this.handshakePromise;
		}

		return this.handshakePromise = new Promise((resolve, reject) => {
			// Create and send the handshake data
			this.packet.handshake();
			const data = this.packet.raw;
			this.parent.socket.send(data, 0, data.length, this.port, this.address, err => err && reject(err));

			// Handler called when a reply to the handshake is received
			this.handshakeResolve = () => {
				clearTimeout(this.handshakeTimeout);
				this.handshakeResolve = null;
				this.handshakeTimeout = null;
				this.handshakePromise = null;

				if(this.id !== this.packet.deviceId) {
					// Update the identifier if needed
					this.id = this.packet.deviceId;
					this.debug = debug('thing:miio:' + this.id);
					this.debug('Identifier of device updated');
				}

				if(this.packet.token) {
					resolve();
				} else {
					const err = new Error('Could not connect to device, token needs to be specified');
					err.code = 'missing-token';
					reject(err);
				}
			};

			// Timeout for the handshake
			this.handshakeTimeout = setTimeout(() => {
				this.handshakeResolve = null;
				this.handshakeTimeout = null;
				this.handshakePromise = null;

				const err = new Error('Could not connect to device, handshake timeout');
				err.code = 'timeout';
				reject(err);
			}, 2000);
		});
	}

	call(method, args, options) {
		if(typeof args === 'undefined') {
			args = [];
		}

		const request = {
			method: method,
			params: args
		};

		if(options && options.sid) {
			// If we have a sub-device set it (used by Lumi Smart Home Gateway)
			request.sid = options.sid;
		}

		return new Promise((resolve, reject) => {
			let resolved = false;

			// Handler for incoming messages
			const promise = {
				resolve: res => {
					resolved = true;
					this.promises.delete(request.id);

					resolve(res);
				},
				reject: err => {
					resolved = true;
					this.promises.delete(request.id);

					if(! (err instanceof Error) && typeof err.code !== 'undefined') {
						const code = err.code;

						const handler = ERRORS[code];
						let msg;
						if(handler) {
							msg = handler(method, args, err.message);
						} else {
							msg = err.message || err.toString();
						}

						err = new Error(msg);
						err.code = code;
					}
					reject(err);
				}
			};

			let retriesLeft = (options && options.retries) || 5;
			const retry = () => {
				if(retriesLeft-- > 0) {
					send();
				} else {
					const err = new Error('Call to device timed out');
					err.code = 'timeout';
					promise.reject(err);
				}
			};

			const send = () => {
				if(resolved) return;

				this.handshake()
					.catch(err => {
						if(err.code === 'timeout') {
							this.debug('<- Handshake timed out');
							retry();
							return false;
						} else {
							throw err;
						}
					})
					.then(token => {
						// Token has timed out - handled via retry
						if(! token) return;

						// Assign the identifier before each send
						let id;
						if(request.id) {
							/*
							 * This is a failure, increase the last id. Should
							 * increase the chances of the new request to
							 * succeed. Related to issues with the vacuum
							 * not responding such as described in issue #94.
							 */
							id = this.lastId + 100;

							// Make sure to remove the failed promise
							this.promises.delete(request.id);
						} else {
							id = this.lastId + 1;
						}

						// Check that the id hasn't rolled over
						if(id >= 10000) {
							this.lastId = id = 1;
						} else {
							this.lastId = id;
						}

						// Assign the identifier
						request.id = id;

						// Store reference to the promise so reply can be received
						this.promises.set(id, promise);

						// Create the JSON and send it
						const json = JSON.stringify(request);
						this.debug('-> (' + retriesLeft + ')', json);
						this.packet.data = Buffer.from(json, 'utf8');

						const data = this.packet.raw;

						this.parent.socket.send(data, 0, data.length, this.port, this.address, err => err && promise.reject(err));

						// Queue a retry in 2 seconds
						setTimeout(retry, 2000);
					})
					.catch(promise.reject);
			};

			send();
		});
	}
}
