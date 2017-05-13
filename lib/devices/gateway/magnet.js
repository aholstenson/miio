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

		// Map status into a boolean named open
		this.defineProperty('status', {
			poll: false,
			name: 'open',
			mapper: v => v === 'open'
		});
	}

	_report(data) {
		const wasOpen = this.property('open');
		super._report(data);

		const isOpen = this.property('open');
		if(wasOpen !== isOpen) {
			this.debug('State changed:', isOpen ? 'Open' : 'Close');
			this.emit(isOpen ? 'open' : 'close');
		}
	}
}

module.exports = Magnet;
