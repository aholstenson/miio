'use strict';

const Device = require('../device');

const Power = require('./capabilities/power');

class EyecareLamp2 extends Device {
	static get TYPE() {
		return 'light'
	}

	constructor(options) {
		super(options);

		this.type = EyecareLamp2.TYPE;

		this.defineProperty('power', {
			name: 'power',
			mapper: v => v === 'on'
		});
		Power.extend(this, {
			set: (channel, power) => this.call('set_power', [power ? 'on' : 'off'], {
				refresh: true
			})

		});

		this.defineProperty('bright', {
			name: 'brightness',
			mapper: parseInt
		});
		this.capabilities.push('brightness');
	}

	/**
	 * Get the current brightness of the light as a percentage between 1 and
	 * 100.
	 */
	get brightness() {
		return this.property('brightness');
	}

	/**
	 * Set the brightness of the device as a percentage between 1 and 100.
	 */
	setBrightness(brightness, options = {}) {
		return this.call('set_bright', [brightness, options], {
			refresh: true
		}).then(Device.checkOk);
	}
}

module.exports = EyecareLamp2;
