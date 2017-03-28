'use strict';

const debug = require('debug')('miio');

const dgram = require('dgram');
const Packet = require('./packet');

const EventEmitter = require('events');
const IDENTITY_MAPPER  = v => v;

class Device extends EventEmitter {
	constructor(options) {
		super();

		this.type = 'generic';
		this.model = options.model || 'unknown';

		this.address = options.address;
		this.port = options.port || 54321;

		this.packet = new Packet();
		this.socket = dgram.createSocket('udp4');
		this.socket.on('message', this._onMessage.bind(this));

		this._id = 0;
		this._promises = {};

		this._properties = {};
		this._propertiesToMonitor = [];
		this._propertyMappers = {};
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
			const data = this.packet.data;
			if(! data) {
				debug('<-', null);
				return;
			}

			let str = data.toString('utf8');
			debug('<-', str);
			let object = JSON.parse(str);

			const p = this._promises[object.id];
			if(! p) return;
			if(object.result) {
				p.resolve(object.result);
			} else {
				p.reject(object.error);
			}

			delete this._promises[object.id];
		}
	}

	_ensureToken() {
		if(! this.packet.needsHandshake) {
			return Promise.resolve();
		}

		if(this._tokenPromise) {
			debug('Using existing promise');
			return this._tokenPromise;
		}

		this._tokenPromise = new Promise((resolve, reject) => {
			this.packet.handshake();
			const data = this.packet.raw;
			this.socket.send(data, 0, data.length, this.port, this.address, err => err && reject(err));
			this._tokenResolve = resolve;

			// Reject in 1 second
			setTimeout(() => {
				this._tokenPromise = null;
				reject();
			}, 1000);
		});
		return this._tokenPromise;
	}

	call(method, params) {
		this._id = this._id == 10000 ? 1 : this._id + 1;
		const json = JSON.stringify({
			id: this._id,
			method: method,
			params: params
		});

		return new Promise((resolve, reject) => {
			let resolved = false;
			this._promises[this._id] = {
				resolve: res => {
					resolved = true;
					resolve(res)
				},
				reject: err => {
					resolved = true;
					reject(err)
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
					})
					.catch(reject);

				if(--sendsLeft > 0) {
					setTimeout(send, 2000);
				} else {
					reject(new Error('Timeout'));
				}
			};

			send();
		});
	}

	setPower(on) {
		return this.call('set_power', [ on ? 'on' : 'off '])
			.then(() => on);
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
	monitor() {
		clearInterval(this._propertyMonitor);

		const loadProperties = () => {
			this.getProperties(this._propertiesToMonitor)
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
					debug('Unable to load properties', err.stack);
				});
		};
		this._propertyMonitor = setInterval(loadProperties, 30000);
		loadProperties();
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
}

module.exports = Device;
