'use strict';

const SubDevice = require('./subdevice');
const { Motion } = require('abstract-things/sensors');
const { Illuminance } = require('../capabilities/sensor');

/**
 * Motion sensing device, emits the event `motion` whenever motion is detected.
 */
module.exports = class extends SubDevice.with(Motion, Illuminance) {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'motion';
		this.model = 'lumi.motion.v2';

		this.updateMotion(false);

		this.defineProperty('lux', {
			name: 'illuminance'
		});
	}

	_report(data) {
		super._report(data);

		if(data.status === 'motion') {
			this.updateMotion(true, '1m');
		}
	}
};
