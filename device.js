'use strict';

const debug = require('debug')('miio');

const dgram = require('dgram');
const Packet = require('./packet');

const EventEmitter = require('events');

const DeviceManagement = require('./management');

const IDENTITY_MAPPER  = v => v;

const ERRORS = {
	'-5001': (method, args, err) => err.message == 'invalid_arg' ? 'Invalid argument' : err.message,
	'-10000': (method) => 'Method `' + method + '` is not supported'
};

class Device extends EventEmitter {
	constructor(options) {
		super();

		this.type = 'generic';
		this.model = options.model || 'unknown';

		this.address = options.address;
		this.port = options.port || 54321;

		this.packet = new Packet();
		if(typeof options.token === 'string') {
			this.packet.token = Buffer.from(options.token, 'hex');
		} else if(options.token instanceof Buffer) {
			this.packet.token = options.token;
		}

		this.socket = dgram.createSocket('udp4');
		this.socket.on('message', this._onMessage.bind(this));

		this._id = 0;
		this._promises = {};
		this._hasFailedToken = false;

		this._properties = {};
		this._propertiesToMonitor = [];
		this._propertyMappers = {};

		this._loadProperties = this._loadProperties.bind(this);

		this.management = new DeviceManagement(this);
	}

	_onMessage(msg) {
		try {
			this.packet.raw = msg;
		} catch(ex) {
			debug('<- Unable to parse packet', ex);
			return;
		}

		if(this._tokenResolve) {
			debug('<-', 'Handshake reply:', this.packet.checksum);
			this.packet.handleHandshakeReply();

			let resolve = this._tokenResolve;

			this._lastToken = Date.now();
			this._tokenResolve = null;
			this._tokenPromise = null;

			resolve();
		} else {
			let data = this.packet.data;
			if(! data) {
				debug('<-', null);
				return;
			}

			// Handle null-terminated strings
			if(data[data.length - 1] == 0) {
				data = data.slice(0, data.length - 1);
			}

			// Parse and handle the JSON message
			let str = data.toString('utf8');
			debug('<- Message: `' + str + '`');
			try {
				let object = JSON.parse(str);

				const p = this._promises[object.id];
				if(! p) return;
				if(typeof object.result !== 'undefined') {
					p.resolve(object.result);
				} else {
					p.reject(object.error);
				}
			} catch(ex) {
				debug('<- Invalid JSON');
			}
		}
	}

	_ensureToken() {
		if(! this.packet.needsHandshake) {
			return Promise.resolve();
		}

		if(this._hasFailedToken) {
			return Promise.reject(new Error('Token could not be auto-discovered'));
		}

		if(this._tokenPromise) {
			debug('Using existing promise');
			return this._tokenPromise;
		}

		this._tokenPromise = new Promise((resolve, reject) => {
			this.packet.handshake();
			const data = this.packet.raw;
			this.socket.send(data, 0, data.length, this.port, this.address, err => err && reject(err));
			this._tokenResolve = () => {
				if(this.packet.token) {
					resolve();
				} else {
					this._hasFailedToken = true;
					reject(new Error('Token could not be auto-discovered'));
				}
			};

			// Reject in 1 second
			setTimeout(() => {
				this._tokenPromise = null;
				reject();
			}, 1000);
		});
		return this._tokenPromise;
	}

	call(method, args, options) {
		if(args) {
			if(! Array.isArray(args) && typeof args !== 'object') {
				throw new Error('Arguments need to be an array or object');
			}
		} else {
			args = [];
		}

		const id = this._id = this._id == 10000 ? 1 : this._id + 1;
		const json = JSON.stringify({
			id: id,
			method: method,
			params: args
		});

		return new Promise((resolve, reject) => {
			let resolved = false;
			const promise = this._promises[id] = {
				resolve: res => {
					resolved = true;
					delete this._promises[id];

					if(options && options.refresh) {
						// Special case for loading properties after setting values
						this._loadProperties()
							.then(() => resolve(res))
							.catch(() => resolve(res));
					} else {
						resolve(res);
					}
				},
				reject: err => {
					resolved = true;
					delete this._promises[id];

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

			let sendsLeft = 3;
			const send = () => {
				if(resolved) return;

				this._ensureToken()
					.then(() => {
						this.packet.data = Buffer.from(json, 'utf8');

						const data = this.packet.raw;

						debug('-> (' + sendsLeft + ')', json);
						this.socket.send(data, 0, data.length, this.port, this.address, err => err && reject(err));

						if(--sendsLeft > 0) {
							setTimeout(send, 2000);
						} else {
							promise.reject(new Error('Timeout'));
						}
					})
					.catch(reject);
			};

			send();
		});
	}

	/**
	 * Define a property and how the value should be mapped. All defined
	 * properties are monitored if #monitor() is called.
	 */
	defineProperty(name, mapper) {
		this._propertiesToMonitor.push(name);
		this._propertyMappers[name] = mapper || IDENTITY_MAPPER;
	}

	_mapProperty(name, value) {
		const mapper = this._propertyMappers[name];
		return mapper ? mapper(value) : value;
	}

	/**
	 * Indicate that you want to monitor defined properties.
	 */
	monitor(interval) {
		clearInterval(this._propertyMonitor);

		this._propertyMonitor = setInterval(this._loadProperties, interval || 30000);
		return this._loadProperties();
	}

	_loadProperties() {
		if(this._propertiesToMonitor.length === 0) return Promise.resolve();

		return this.getProperties(this._propertiesToMonitor)
			.then(values => {
				const oldValues = this._properties;
				Object.keys(values).forEach(key => {
					const oldValue = oldValues[key];
					const newValue = values[key];

					if(oldValue !== newValue) {
						debug('Property', key, 'changed from', oldValue, 'to', newValue);
						this.emit('propertyChanged', {
							property: key,
							oldValue: oldValue,
							value: newValue
						});
					}

					oldValues[key] = newValue;
				});
			})
			.catch(err => {
				debug('Unable to load properties', err && err.stack ? err.stack : err);
			});
	}

	stopMonitoring() {
		clearInterval(this._propertyMonitor);
	}

	property(key) {
		return this._properties[key];
	}

	getProperties(props) {
		return this.call('get_prop', props)
			.then(result => {
				const obj = {};
				for(let i=0; i<result.length; i++) {
					obj[props[i]] = this._mapProperty(props[i], result[i]);
				}
				return obj;
			});
	}

	/**
	 * Destroy this instance, this instance will no longer be able to
	 * communicate with the remote device it represents.
	 */
	destroy() {
		this.stopMonitoring();
		this.socket.close();
	}

	discover() {
		return this._ensureToken()
			.then(() => {
				return {
					token: this.packet.token
				}
			});
	}

	updateToken(token) {
		// Update the token used for this device
		this._hasFailedToken = false;

		if(typeof token === 'string') {
			this.packet.token = Buffer.from(token, 'hex');
		} else if(token instanceof Buffer) {
			this.packet.token = token;
		} else {
			throw new Error('Unknown type of token: ' + token);
		}

		// Reload properties when token is updated
		this._loadProperties();
	}
}

module.exports = Device;
