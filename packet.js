'use strict';

const crypto = require('crypto');

class Packet {
	constructor() {
		this.header = Buffer.alloc(2 + 2 + 4 + 4 + 4 + 16);
		this.header[0] = 0x21;
		this.header[1] = 0x31;

		for(let i=4; i<32; i++) {
			this.header[i] = 0xff;
		}
	}

	handshake() {
		this.data = null;
	}

	get raw() {
		if(this.data) {
			if(! this._token) {
				throw new Error('Token is required to send commands');
			}

			// Encrypt the data
			let cipher = crypto.createCipheriv('aes-128-cbc', this._tokenKey, this._tokenIV);
			let encrypted = Buffer.concat([
				cipher.update(this.data),
				cipher.final()
			]);

			// Set the length
			this.header.writeInt16BE(32 + encrypted.length, 2);

			// Calculate the checksum
			let digest = crypto.createHash('md5')
				.update(this.header.slice(0, 16))
				.update(this._token)
				.update(encrypted)
				.digest();
			digest.copy(this.header, 16);

			return Buffer.concat([ this.header, encrypted ]);
		} else {
			this.header.writeInt16BE(32, 2);

			for(let i=4; i<32; i++) {
				this.header[i] = 0xff;
			}

			return this.header;
		}
	}

	set raw(msg) {
		this.header = msg.slice(0, 32);
		const encrypted = msg.slice(32);
		if(encrypted.length > 0) {
			let decipher = crypto.createDecipheriv('aes-128-cbc', this._tokenKey, this._tokenIV);
			this.data = Buffer.concat([
				decipher.update(encrypted),
				decipher.final()
			]);
		}
	}

	get token() {
		return this._token;
	}

	set token(t) {
		this._token = t;
		this._tokenKey = crypto.createHash('md5').update(t).digest();
		this._tokenIV = crypto.createHash('md5').update(this._tokenKey).update(t).digest();
	}

	get checksum() {
		return this.header.slice(16);
	}
}

module.exports = Packet;
