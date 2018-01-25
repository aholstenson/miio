'use strict';

const tokens = require('./tokens');

/**
 * Management of a device. Supports quering it for information and changing
 * the WiFi settings.
 */
class DeviceManagement {
	constructor(device) {
		this.api = device.handle.api;
	}

	get model() {
		return this.api.model;
	}

	get token() {
		const token = this.api.token;
		return token ? token.toString('hex') : null;
	}

	get autoToken() {
		return this.api.autoToken;
	}

	get address() {
		return this.api.address;
	}

	/**
	 * Get information about this device. Includes model info, token and
	 * connection information.
	 */
	info() {
		return this.api.call('miIO.info');
	}

	/**
	 * Update the wireless settings of this device. Needs `ssid` and `passwd`
	 * to be set in the options object.
	 *
	 * `uid` can be set to associate the device with a Mi Home user id.
	 */
	updateWireless(options) {
		if(typeof options.ssid !== 'string') {
			throw new Error('options.ssid must be a string');
		}
		if(typeof options.passwd !== 'string') {
			throw new Error('options.passwd must be a string');
		}

		return this.api.call('miIO.config_router', options)
			.then(result => {
				if(result !== 0 && result !== 'OK' && result !== 'ok') {
					throw new Error('Failed updating wireless');
				}
				return true;
			});
	}

	/**
	 * Get the wireless state of this device. Includes if the device is
	 * online and counters for things such as authentication failures and
	 * connection success and failures.
	 */
	wirelessState() {
		return this.api.call('miIO.wifi_assoc_state');
	}

	/**
	 * Update the token used to connect to this device.
	 *
	 * @param {string|Buffer} token
	 */
	updateToken(token) {
		if(token instanceof Buffer) {
			token = token.toString('hex');
		} else if(typeof token !== 'string') {
			return Promise.reject(new Error('Token must be a hex-string or a Buffer'));
		}

		// Lazily imported to solve recursive dependencies
		const connectToDevice = require('./connectToDevice');

		return connectToDevice({
			address: this.address,
			port: this.port,
			token: token
		}).then(device => {
			// Connection to device could be performed
			return tokens.update(this.api.id, token)
				.then(() => device.destroy())
				.then(() => true);
		}).catch(err => {
			// Connection to device failed with the token
			return false;
		});
	}
}

module.exports = DeviceManagement;
