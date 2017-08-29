'use strict';

const Device = require('../device');

const Power = require('./capabilities/power');

class BallLamp extends Device {
	static get TYPE() {
		return 'light'
	}

	constructor(options) {
		super(options);

		this.type = BallLamp.TYPE;

		this.defineProperty('power', {
			name: 'power',
			mapper: v => v === 'on'
		});
		Power.extend(this, {
			set: power => this.call('set_power', [power ? 'on' : 'off'], {
				refresh: true
			})

		});

		this.defineProperty('bright', {
			name: 'brightness',
			mapper: parseInt
		});
		this.capabilities.push('brightness');

		this.defineProperty('cct', {
			name: 'colorTemperature',
			mapper: parseInt
		});
		this.capabilities.push('color:temperature');
	}

	// Get brightness from 1 to 100
	get brightness() {
		return this.property('brightness');
	}

	// Get color temp from 1 (lowest/warmest) to 100
	get colorTemperature() {
		return this.property('colorTemperature');
	}

	// Set brightness
	setBrightness(brightness, options = {}) {
		return this.call('set_bright', [brightness, options], {
			refresh: true
		}).then(Device.checkOk);
	}

	// Set color temp
	setColorTemperature(brightness, options = {}) {
		return this.call('set_cct', [brightness, options], {
			refresh: true
		}).then(Device.checkOk);
	}

}

module.exports = BallLamp;