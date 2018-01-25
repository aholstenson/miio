'use strict';

const SubDevice = require('./subdevice');
const { Motion } = require('abstract-things/sensors');
const Voltage = require('./voltage');

/**
 * Motion sensing device, emits the event `motion` whenever motion is detected.
 */
module.exports = class extends SubDevice.with(Motion, Voltage) {
	constructor(parent, info) {
		super(parent, info);

		this.miioModel = 'lumi.motion';

		this.updateMotion(false);

	}

	_report(data) {
		super._report(data);

		if(typeof data.status !== 'undefined' && data.status === 'motion') {
			this.updateMotion(true, '1m');
		}
	}
};
