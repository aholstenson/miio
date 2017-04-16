
const SubDevice = require('./subdevice');

class Switch2 extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'controller';
		this.model = 'lumi.86sw2';

		this.defineProperty('voltage');
	}

	_report(info) {
		super._report(info);

		if(typeof info.data['channel_0'] !== 'undefined') {
			const action = 'btn0-' + info.data['channel_0'];
			this.debug('Action performed:', action);
			this.emit('action', {
				id: action
			});

			delete info.data['channel_0'];
		}

		if(typeof info.data['channel_1'] !== 'undefined') {
			const action = 'btn1-' + info.data['channel_1'];
			this.debug('Action performed:', action);
			this.emit('action', {
				id: action
			});

			delete info.data['channel_1'];
		}

		if(typeof info.data['dual_channel'] !== 'undefined') {
			const action = info.data['dual_channel'];

			this.debug('Action performed:', action);
			this.emit('action', {
				id: action
			});

			delete info.data['dual_channel'];
		}
	}

	get actions() {
		return [
			'btn0-click',
			'btn0-double_click',
			'btn1-click',
			'btn2-double_click',
			'both_click'
		];
	}
}

module.exports = Switch2;
