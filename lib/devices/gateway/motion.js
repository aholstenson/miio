
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

		this.defineProperty('voltage');
	}

	_report(info) {
		super._report(info);

		if(info.data.status === 'motion') {
			this.emit('motion');
			delete info.data.status;
		}
	}
}

module.exports = Motion;
