'use strict';

const SubDevice = require('./subdevice');
const { Motion } = require('abstract-things/sensors');

/**
 * Motion sensing device, emits the event `motion` whenever motion is detected.
 */
module.exports = class extends SubDevice.with(Motion) {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'motion';
		this.model = 'lumi.motion';

		this.updateMotion(false);
	}

	_report(data) {
		super._report(data);

		if(data.status === 'motion') {
			this.updateMotion(true, '1m');
		}
	}
};
