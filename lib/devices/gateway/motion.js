'use strict';


const SubDevice = require('./subdevice');

/**
 * Motion sensing device, emits the event `motion` whenever motion is detected.
 *
 * This will not emit any event when motion is no longer detected.
 */
class Motion extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'motion';
		this.model = 'lumi.motion';
	}

	_report(data) {
		super._report(data);

		if(data.status === 'motion') {
			this.debug('Detected motion');
			this.emit('motion');
		}
	}
}

module.exports = Motion;
