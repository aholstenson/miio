'use strict';

const dgram = require('dgram');
const Packet = require('./packet');

class Device {
	constructor(address) {
		this.address = address;

		this.packet = new Packet();
		this.socket = dgram.createSocket('udp4');
		this.socket.on('message', this._onMessage.bind(this));

		this._id = 0;
		this._promises = {};
	}

	_onMessage(msg) {
		this.packet.raw = msg;

		if(this._tokenResolve) {
			this.packet.token = this.packet.checksum;
			this._tokenResolve();
			this._lastToken = Date.now();
			this._tokenResolve = null;
			this._tokenPromise = null;
		} else {
			let str = this.packet.data.toString('utf8');
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
		if(this._lastToken > Date.now() - 60000) {
			return Promise.resolve();
		}

		if(this._tokenPromise) {
			return this._tokenPromise;
		}

		this._tokenPromise = new Promise((resolve, reject) => {
			const data = this.packet.raw;
			this.socket.send(data, 0, data.length, 54321, this.address, err => err && reject(err));
			this._tokenResolve = resolve;
		});
		return this._tokenPromise;
	}

	call(method, params) {
		return this._ensureToken()
			.then(() => {
				this._id = this._id == 10000 ? 1 : this._id + 1;
				this.packet.data = Buffer.from(JSON.stringify({
					id: this._id,
					method: method,
					params: params
				}), 'utf8');

				const data = this.packet.raw;

				return new Promise((resolve, reject) => {
					this._promises[this._id] = {
						resolve: resolve,
						reject: reject
					};

					this.socket.send(data, 0, data.length, 54321, this.address, err => err && reject(err));
				});
			});
	}

	setPower(on) {
		return this.call('set_power', [ on ? 'on' : 'off '])
			.then(() => on);
	}

	getProperties(props) {
		return this.call('get_prop', props)
			.then(result => {
				const obj = {};
				for(let i=0; i<result.length; i++) {
					obj[props[i]] = result[i];
				}
				return obj;
			});
	}
}

module.exports.Device = Device;
