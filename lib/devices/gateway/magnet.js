
const SubDevice = require('./subdevice');

/**
 * Magnet device, emits events `open` and `close` if the state changes.
 */
class Magnet extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'magnet';
		this.model = 'lumi.magnet';

		this.defineProperty('voltage');

		// Map status into a boolean named open
		this.defineProperty('status', {
			name: 'open',
			mapper: v => v === 'open'
		});
	}

	_report(info) {
		const wasOpen = this.property('open');
		super._report(info);

		const isOpen = this.property('open');
		if(wasOpen !== isOpen) {
			this.emit(isOpen ? 'open' : 'close');
		}
	}
}

module.exports = Magnet;
