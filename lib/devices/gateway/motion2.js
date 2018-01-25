'use strict';

const SubDevice = require('./subdevice');
const { Motion } = require('abstract-things/sensors');
const { Illuminance } = require('../capabilities/sensor');
const Voltage = require('./voltage');

/**
 * Motion sensing device, emits the event `motion` whenever motion is detected.
 */
module.exports = class extends SubDevice.with(Motion, Illuminance, Voltage) {
	constructor(parent, info) {
		super(parent, info);

		this.miioModel = 'lumi.motion.aq2';

		this.defineProperty('status');

		this.defineProperty('lux', {
			name: 'illuminance'
		});
	}

	_report(data) {
		super._report(data);

		if(typeof data.status !== 'undefined' && data.status === 'motion') {
			this.updateMotion(true, '1m');
		}
	}
};
