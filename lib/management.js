'use strict';


/**
 * Management of a device. Supports quering it for information and changing
 * the WiFi settings.
 */
class DeviceManagement {
	constructor(device) {
		this.device = device;
	}

	/**
	 * Get information about this device. Includes model info, token and
	 * connection information.
	 */
	info() {
		return this.device.call('miIO.info');
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

		return this.device.call('miIO.config_router', options)
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
		return this.device.call('miIO.wifi_assoc_state');
	}
}

module.exports = DeviceManagement;
