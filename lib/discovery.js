'use strict';

const { BasicDiscovery, TimedDiscovery, search, addService, removeService } = require('tinkerhub-discovery');
const { Children } = require('abstract-things');

const util = require('util');
const dgram = require('dgram');
const dns = require('dns');

const infoFromHostname = require('./infoFromHostname');
const Packet = require('./packet');
const Tokens = require('./tokens');

const connectToDevice = require('./connectToDevice');

const PORT = 54321;

const tryAdd = Symbol('tryAdd');

const Browser = module.exports.Browser = class Browser extends TimedDiscovery {
	static get type() {
		return 'miio';
	}

	constructor(options) {
		super({
			maxStaleTime: (options.cacheTime || 1800) * 1000
		});

		if(typeof options.useTokenStorage !== 'undefined' ? options.useTokenStorage : true) {
			this.tokens = new Tokens();
		}

		this.manualTokens = options.tokens || {};

		this._packet = new Packet();
		this.start();
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
						this[tryAdd]({
							id: id,
							address: rinfo.address,
							port: rinfo.port,
							token: storedToken || this._manualToken(id),
							autoToken: false
						});
					});
			} else {
				// Token could be discovered or no token storage
				this[tryAdd]({
					id: id,
					address: rinfo.address,
					port: rinfo.port,
					token: token || this._manualToken(id),
					autoToken: true
				});
			}
		});

		super.start();
	}

	stop() {
		super.stop();

		this.socket.close();
	}

	[search]() {
		this._packet.handshake();
		const data = Buffer.from(this._packet.raw);
		this._socket.send(data, 0, data.length, PORT, '255.255.255.255');

		// Broadcast an extra time in 500 milliseconds in case the first brodcast misses a few devices
		setTimeout(() => {
			this._socket.send(data, 0, data.length, PORT, '255.255.255.255');
		}, 500);
	}

	[tryAdd](service) {
		const add = () => this[addService](service);

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

	[util.inspect.custom]() {
		return 'MiioBrowser{}';
	}
};

class Devices extends BasicDiscovery {
	static get type() {
		return 'miio:devices';
	}

	constructor(options) {
		super();

		this._filter = options && options.filter;
		this._skipSubDevices = options && options.skipSubDevices;

		this._browser = new Browser(options)
			.map(reg => {
				return connectToDevice(reg)
					.then(device => {
						reg.device = device;
						return reg;
					});
			});

		this._browser.on('available', s => {
			this[addService](s);

			if(s.device instanceof Children) {
				this._bindSubDevices(s.device);
			}
		});

		this._browser.on('unavailable', s => {
			this[removeService](s);
		});
	}

	start() {
		super.start();

		this._browser.start();
	}

	stop() {
		super.stop();

		this._browser.stop();
	}

	[util.inspect.custom]() {
		return 'MiioDevices{}';
	}

	_bindSubDevices(device) {
		if(this._skipSubDevices) return;

		const handleAvailable = sub => {
			const reg = {
				id: sub.internalId,
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
			this[addService](reg);
		};

		device.on('thing:available', handleAvailable);
		device.on('thing:unavailable', sub => this[removeService](sub.id));

		// Register initial devices
		for(const child of device.children) {
			handleAvailable(child);
		}
	}
}

module.exports.Devices = Devices;
