
const SubDevice = require('./subdevice');

class Switch1 extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'controller';
		this.model = 'lumi.86sw1';

		this.defineProperty('voltage');
	}

	_report(info) {
		super._report(info);

		if(typeof info.data['channel_0'] !== 'undefined') {
			const action = info.data['channel_0'];
			this.debug('Action performed:', action);
			this.emit('action', {
				id: action
			});

			delete info.data['channel_0'];
		}
	}

	get actions() {
		return [
			'click',
			'double_click'
		];
	}
}

module.exports = Switch1;
