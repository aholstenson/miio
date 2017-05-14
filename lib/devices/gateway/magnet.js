'use strict';


const SubDevice = require('./subdevice');

/**
 * Magnet device, emits events `open` and `close` if the state changes.
 */
class Magnet extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'magnet';
		this.model = 'lumi.magnet';
	}

	_report(data) {
		super._report(data);

		const wasOpen = this.property('open');
		const isOpen = data['status'] === 'open';
		this.setProperty('open', isOpen);
		if(wasOpen !== isOpen) {
			this.debug('State changed, emitting', isOpen ? 'open' : 'close');
			this.emit(isOpen ? 'open' : 'close');
		}
	}
}

module.exports = Magnet;
