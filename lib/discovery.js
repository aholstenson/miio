
const dgram = require('dgram');
const dns = require('dns');
const EventEmitter = require('events').EventEmitter;

const infoFromHostname = require('./infoFromHostname');
const Packet = require('./packet');

const PORT = 54321;

class Browser {
	constructor(cacheTime) {
		this.cacheTime = (cacheTime || 1800) * 1000;

		this._events = new EventEmitter();
		this._services = {};

		this._packet = new Packet();
		this.start();
	}

	on(event, cb) {
		this._events.on(event, cb);
	}

	off(event, cb) {
		this._events.off(event, cb);
	}

	start() {
		this._socket  = dgram.createSocket('udp4');
		this._socket.bind();
		this._socket.on('listening', () => this._socket.setBroadcast(true));
		this._socket.on('message', (msg, rinfo) => {
			const buf = Buffer.from(msg);
			this._packet.raw = buf;
			let token = this._packet.checksum.toString('hex');
			if(token.match(/^[fF]+$/)) {
				token = null;
			}

			this._addService({
				id: this._packet.deviceId,
				address: rinfo.address,
				port: rinfo.port,
				token: token
			});
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

module.exports = Browser;
