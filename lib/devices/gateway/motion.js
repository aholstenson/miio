'use strict';

const SubDevice = require('./subdevice');
const { Motion } = require('abstract-things/sensors');

/**
 * Motion sensing device, emits the event `motion` whenever motion is detected.
 */
module.exports = class extends SubDevice.with(Motion) {
	constructor(parent, info) {
		super(parent, info);

		this.miioModel = 'lumi.motion';

		this.updateMotion(false);

		this.defineProperty('status');
	}

	propertyChanged(key, value, oldValue) {
		if(key === 'status' && value === 'motion') {
			this.updateMotion(true, '1m');
		}

		super.propertyChanged(key, value, oldValue);
	}
};
