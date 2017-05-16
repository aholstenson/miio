'use strict';


const dgram = require('dgram');
const dns = require('dns');
const EventEmitter = require('events').EventEmitter;

const infoFromHostname = require('./infoFromHostname');
const Packet = require('./packet');
const Tokens = require('./tokens');

const connectToDevice = require('./connectToDevice');

const PORT = 54321;

class Browser {
	constructor(options) {
		this.cacheTime = (options.cacheTime || 1800) * 1000;

		if(typeof options.useTokenStorage !== 'undefined' ? options.useTokenStorage : true) {
			this.tokens = new Tokens();
		}

		this.manualTokens = options.tokens || {};

		this._events = new EventEmitter();
		this._services = {};

		this._packet = new Packet();
		this.start();
	}

	on(event, cb) {
		this._events.on(event, cb);
	}

	removeListener(event, cb) {
		this._events.removeListener(event, cb);
	}

	_manualToken(id) {
		return this.manualTokens[id] || null;
	}

	start() {
		this._socket  = dgram.createSocket('udp4');
		this._socket.bind();
		this._socket.on('listening', () => this._socket.setBroadcast(true));
		this._socket.on('message', (msg, rinfo) => {
			const buf = Buffer.from(msg);
			this._packet.raw = buf;
			let token = this._packet.checksum.toString('hex');
			if(token.match(/^[fF0]+$/)) {
				token = null;
			}

			const id = String(this._packet.deviceId);
			if(! token && this.tokens) {
				this.tokens.get(id)
					.then(storedToken => {
						this._addService({
							id: id,
							address: rinfo.address,
							port: rinfo.port,
							token: storedToken || this._manualToken(id),
							autoToken: false
						});
					})
			} else {
				// Token could be discovered or no token storage
				this._addService({
					id: id,
					address: rinfo.address,
					port: rinfo.port,
					token: token || this._manualToken(id),
					autoToken: true
				});
			}
		});

		this._searchHandle = setInterval(this._search.bind(this), this.cacheTime / 3);
		this._removeStaleHandle = setInterval(this._removeStale.bind(this), this.cacheTime);

		this._search();
	}

	stop() {
		clearInterval(this._searchHandle);
		clearInterval(this._removeStaleHandle);

		this._searchHandle = null;
		this._removeStaleHandle = null;

		this.socket.close();
	}

	_search() {
		this._packet.handshake();
		const data = Buffer.from(this._packet.raw);
		this._socket.send(data, 0, data.length, PORT, '255.255.255.255');

		if(this.cacheTime / 3 > 500) {
			// Broadcast an extra time in 500 milliseconds in case the first brodcast misses a few devices
			setTimeout(() => {
				this._socket.send(data, 0, data.length, PORT, '255.255.255.255');
			}, 500);
		}
	}

	_addService(service) {
		const existing = this._services[service.id];

		this._services[service.id] = service;
		service.lastSeen = Date.now();

		if(existing) {
			// This is an existing device, skip extra discovery
			if(existing.address !== service.address) {
				this._events.emit('update', service);
			}

			return;
		}

		let added = false;
		const add = () => {
			if(added) return;
			added = true;

			this._events.emit('available', service);
		}

		// Give us five seconds to try resolve some extras for new devices
		setTimeout(add, 5000);

		dns.lookupService(service.address, service.port, (err, hostname) => {
			if(err || ! hostname) {
				add();
				return;
			}

			service.hostname = hostname;
			const info = infoFromHostname(hostname);
			if(info) {
				service.type = info.type;
				service.model = info.model;
			}

			add();
		});
	}

	_removeService(name) {
		const service = this._services[name];
		if(! service) return;

		delete this._services[name];
		this._events.emit('unavailable', service);
	}

	_removeStale() {
		const staleTime = Date.now() - this.cacheTime;
		Object.keys(this._services).forEach(key => {
			const service = this._services[key];
			if(service.lastSeen < staleTime) {
				delete this._services[key];
				this._events.emit('unavailable', service);
			}
		})
	}
}

class Devices {
	constructor(options) {
		this._events = new EventEmitter();

		this._filter = options && options.filter;
		this._skipSubDevices = options && options.skipSubDevices;
		this._devices = {};

		this._browser = new Browser(options);
		this._browser.on('available', this._serviceAvailable.bind(this));
		this._browser.on('unavailable', this._serviceUnavailable.bind(this));
	}

	on(event, cb) {
		this._events.on(event, cb);
	}

	removeListener(event, cb) {
		this._events.removeListener(event, cb);
	}

	start() {
		this._browser.start();
	}

	stop() {
		this._browser.stop();
	}

	_serviceAvailable(service) {
		if(this._filter && ! this._filter(service)) {
			// Filter does not match this device
			return;
		}

		let reg = this._devices[service.id];
		if(! reg) {
			reg = this._devices[service.id] = Object.assign({
				device: null
			}, service);
		}

		// Return if we are already connecting to this device
		if(reg.connectionPromise) return;

		if(reg.token) {
			// This device has a token so it's possible to connect to it
			reg.connectionPromise = connectToDevice(service)
				.then(device => {
					reg.device = device;
					this._events.emit('available', reg);

					if(device.type === 'gateway') {
						this._bindSubDevices(device);
					}
				})
				.catch(err => {
					reg.error = err;
					this._events.emit('available', reg);

					err.device = service;
					this._events.emit('error', err);
				})
				.then(() => {
					delete reg.connectionPromise;
				});
		} else {
			// There is no token so emit even directly
			this._events.emit('available', reg);
		}
	}

	_serviceUnavailable(service) {
		const reg = this._devices[service.id];
		if(! reg) return;

		if(reg.device) {
			reg.device.destroy();
		}
		delete this._devices[service.id];
		this._events.emit('unavailable', reg);

		Object.keys(this._devices).forEach(key => {
			const subReg = this._devices[key];
			if(subReg.parent && subReg.parent.id == service.id) {
				// This device belongs to the service being removed
				delete this._devices[key];
				subReg.device.destroy();
				this._events.emit('unavailable', subReg);
			}
		});
	}

	_bindSubDevices(device) {
		if(this._skipSubDevices) return;

		const handleAvailable = sub => {
			const reg = {
				id: sub.id,
				model: sub.model,
				type: sub.type,

				parent: device,
				device: sub
			};

			if(this._filter && ! this._filter(reg)) {
				// Filter does not match sub device
				return;
			}

			// Register and emit event
			this._devices[sub.id] = reg;
			this._events.emit('available', reg);
		};

		device.on('deviceAvailable', handleAvailable);
		device.on('deviceUnavailable', sub => this._serviceUnavailable(sub));

		// Register initial devices
		device.devices.forEach(handleAvailable);
	}
}

module.exports.Browser = Browser;
module.exports.Devices = Devices;
