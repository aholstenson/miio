'use strict';

const dgram = require('dgram');
const Packet = require('./packet');

const EventEmitter = require('events');

const DeviceManagement = require('./management');

const IDENTITY_MAPPER  = v => v;

const ERRORS = {
	'-5001': (method, args, err) => err.message == 'invalid_arg' ? 'Invalid argument' : err.message,
	'-5005': (method, args, err) => err.message == 'params error' ? 'Invalid argument' : err.message,
	'-10000': (method) => 'Method `' + method + '` is not supported'
};

class Device extends EventEmitter {
	constructor(options) {
		super();

		this.id = options.id;
		this.type = 'generic';
		this.model = options.model || 'unknown';
		this.capabilities = [];

		this.address = options.address;
		this.port = options.port || 54321;
		this.writeOnly = options.writeOnly || false;

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
		this._propertyDefinitions = {};
		this._reversePropertyDefinitions = {};

		this._loadProperties = this._loadProperties.bind(this);

		this.management = new DeviceManagement(this);

		this.debug = require('debug')('miio.device.' + (options.id || '[' + options.address + ']'));
	}

	init() {
		// Default setup involves activating monitoring
		return this.monitor();
	}

	hasCapability(name) {
		return this.capabilities.indexOf(name) >= 0;
	}

	_onMessage(msg) {
		try {
			this.packet.raw = msg;
		} catch(ex) {
			this.debug('<- Unable to parse packet', ex);
			return;
		}

		if(this._tokenResolve) {
			this.debug('<-', 'Handshake reply:', this.packet.checksum);
			this.packet.handleHandshakeReply();

			this._lastToken = Date.now();

			this._tokenResolve();
		} else {
			let data = this.packet.data;
			if(! data) {
				this.debug('<-', null);
				return;
			}

			// Handle null-terminated strings
			if(data[data.length - 1] == 0) {
				data = data.slice(0, data.length - 1);
			}

			// Parse and handle the JSON message
			let str = data.toString('utf8');

			// Remove non-printable characters to invalid JSON from devices
			str = str.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ''); // eslint-disable-line

			this.debug('<- Message: `' + str + '`');
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
				this.debug('<- Invalid JSON', ex);
			}
		}
	}

	_ensureToken() {
		if(! this.packet.needsHandshake) {
			return Promise.resolve(true);
		}

		if(this._hasFailedToken) {
			return Promise.reject(new Error('Token could not be auto-discovered'));
		}

		if(this._tokenPromise) {
			this.debug('Using existing promise');
			return this._tokenPromise;
		}

		this._tokenPromise = new Promise((resolve, reject) => {
			this.debug('-> Handshake');
			this.packet.handshake();
			const data = this.packet.raw;
			this.socket.send(data, 0, data.length, this.port, this.address, err => err && reject(err));
			this._tokenResolve = () => {
				delete this._tokenPromise;
				delete this._tokenResolve;
				clearTimeout(this._tokenTimeout);
				delete this._tokenTimeout;

				if(this.packet.token) {
					resolve(true);
				} else {
					this._hasFailedToken = true;
					reject(new Error('Token could not be auto-discovered'));
				}
			};

			// Reject in 1 second
			this._tokenTimeout = setTimeout(() => {
				delete this._tokenPromise;
				delete this._tokenResolve;
				delete this._tokenTimeout;

				const err = new Error('Handshake timeout');
				err.code = 'timeout';
				reject(err);
			}, 1500);
		});
		return this._tokenPromise;
	}

	call(method, args, options) {
		if(typeof args === 'undefined') {
			args = [];
		}

		const id = this._id = this._id == 10000 ? 1 : this._id + 1;
		const request = {
			id: id,
			method: method,
			params: args
		};

		if(options && options.sid) {
			// If we have a sub-device set it (used by Lumi Smart Home Gateway)
			request.sid = options.sid;
		}

		const json = JSON.stringify(request);

		return new Promise((resolve, reject) => {
			let resolved = false;
			const promise = this._promises[id] = {
				resolve: res => {
					resolved = true;
					delete this._promises[id];

					if(options && options.refresh) {
						// Special case for loading properties after setting values
						// - delay a bit to make sure the device has time to respond
						setTimeout(() => {
							const properties = Array.isArray(options.refresh) ? options.refresh : this._propertiesToMonitor;
							this._loadProperties(properties)
								.then(() => resolve(res))
								.catch(() => resolve(res))
						}, (options && options.refreshDelay) || 50);
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

				this._ensureToken()
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

						this.debug('-> (' + retriesLeft + ')', json);
						this.packet.data = Buffer.from(json, 'utf8');

						const data = this.packet.raw;

						this.socket.send(data, 0, data.length, this.port, this.address, err => err && promise.reject(err));

						// Queue a retry in 2 seconds
						setTimeout(retry, 2000);
					})
					.catch(promise.reject);
			};

			send();
		});
	}

	/**
	 * Define a property and how the value should be mapped. All defined
	 * properties are monitored if #monitor() is called.
	 */
	defineProperty(name, def) {
		this._propertiesToMonitor.push(name);

		if(typeof def === 'function') {
			def = {
				mapper: def
			};
		} else if(typeof def === 'undefined') {
			def = {
				mapper: IDENTITY_MAPPER
			}
		}

		if(! def.mapper) {
			def.mapper = IDENTITY_MAPPER;
		}

		if(def.name) {
			this._reversePropertyDefinitions[def.name] = name;
		}
		this._propertyDefinitions[name] = def;
	}

	/**
	 * Indicate that you want to monitor defined properties.
	 */
	monitor(interval) {
		if(this._propertiesToMonitor.length === 0 || this.writeOnly) {
			// No properties or write only, resolve without doing anything
			return Promise.resolve();
		}

		clearInterval(this._propertyMonitor);

		this._propertyMonitor = setInterval(this._loadProperties, interval || this._monitorInterval || 30000);
		return this._loadProperties();
	}

	_pushProperty(result, name, value) {
		const def = this._propertyDefinitions[name];
		if(! def) {
			result[name] = value;
		} else if(def.handler) {
			def.handler(result, value);
		} else {
			result[def.name || name] = def.mapper(value);
		}
	}

	_loadProperties(properties) {
		if(typeof properties === 'undefined') {
			properties = this._propertiesToMonitor;
		}

		if(properties.length === 0 || this.writeOnly) return Promise.resolve();

		return this.loadProperties(properties)
			.then(values => {
				Object.keys(values).forEach(key => {
					this.setProperty(key, values[key]);
				});
			})
			.catch(err => {
				this.debug('Unable to load properties', err && err.stack ? err.stack : err);
				throw err;
			});
	}

	setProperty(key, value) {
		const oldValue = this._properties[key];

		if(oldValue !== value) {
			this._properties[key] = value;
			this.debug('Property', key, 'changed from', oldValue, 'to', value);
			this.emit('propertyChanged', {
				property: key,
				oldValue: oldValue,
				value: value
			});
		}
	}

	setRawProperty(name, value) {
		const def = this._propertyDefinitions[name];
		if(! def) return;

		if(def.handler) {
			const result = {};
			def.handler(result, value);
			Object.keys(result).forEach(key => {
				this.setProperty(key, result[key]);
			});
		} else {
			this.setProperty(def.name || name, def.mapper(value));
		}
	}

	stopMonitoring() {
		clearInterval(this._propertyMonitor);
	}

	property(key) {
		return this._properties[key];
	}

	get properties() {
		return Object.assign({}, this._properties);
	}

	getProperties(props) {
		const result = {};
		props.forEach(key => {
			result[key] = this._properties[key];
		});
		return result;
	}

	loadProperties(props) {
		// Rewrite property names to device internal ones
		props = props.map(key => this._reversePropertyDefinitions[key] || key);

		// Call get_prop to map everything
		return this.call('get_prop', props)
			.then(result => {
				const obj = {};
				for(let i=0; i<result.length; i++) {
					this._pushProperty(obj, props[i], result[i]);
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

	/**
	 * Check that the current result is equal to the string `ok`.
	 */
	static checkOk(result) {
		if(result != 'ok') throw new Error('Could not perform operation');

		return null;
	}
}

module.exports = Device;
