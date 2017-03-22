'use strict';

const dgram = require('dgram');
const Packet = require('./packet');

const debug = require('debug')('miio');

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
			debug('<-', 'Handshake reply:', this.packet.checksum);
			this.packet.handleHandshakeReply();

			this._tokenResolve();
			this._lastToken = Date.now();
			this._tokenResolve = null;
			this._tokenPromise = null;
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
			this.socket.send(data, 0, data.length, 54321, this.address, err => err && reject(err));
			this._tokenResolve = resolve;

			// Reject in 1 second
			setTimeout(reject, 1000);
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
						this.socket.send(data, 0, data.length, 54321, this.address, err => err && reject(err));
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
