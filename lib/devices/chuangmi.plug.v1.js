'use strict';

const Device = require('../device');

const PowerChannels = require('./capabilities/power-channels');

class PlugV1 extends Device {
	static get TYPE() { return 'switch' }

	constructor(options) {
		super(options);

		this.type = PlugV1.TYPE;

		this.defineProperty('on', {
			name: 'powerChannel0'
		});
		PowerChannels.extend(this, {
			channels: 1,
			set: (channel, power) => this.call(power ? 'set_on' : 'set_off', [])
		});

		this.defineProperty('usb_on', {
			name: 'powerUSB'
		});
	}

	get powerUSB() {
		return this.property('powerUSB');
	}

	setPowerUSB(power) {
		return this.call(power ? 'set_usb_on' : 'set_usb_off', [])
			.then(() => power);
	}
}

module.exports = PlugV1;
