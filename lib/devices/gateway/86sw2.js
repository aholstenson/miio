'use strict';


const SubDevice = require('./subdevice');

class Switch2 extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'controller';
		this.model = 'lumi.86sw2';
	}

	_report(data) {
		super._report(data);

		if(typeof data['channel_0'] !== 'undefined') {
			const action = 'btn0-' + data['channel_0'];
			this.debug('Action performed:', action);
			this.emit('action', {
				id: action
			});
		}

		if(typeof data['channel_1'] !== 'undefined') {
			const action = 'btn1-' + data['channel_1'];
			this.debug('Action performed:', action);
			this.emit('action', {
				id: action
			});
		}

		if(typeof data['dual_channel'] !== 'undefined') {
			const action = data['dual_channel'];

			this.debug('Action performed:', action);
			this.emit('action', {
				id: action
			});
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
