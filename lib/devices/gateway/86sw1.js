'use strict';


const SubDevice = require('./subdevice');

class Switch1 extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'controller';
		this.model = 'lumi.86sw1';
	}

	_report(data) {
		super._report(data);

		if(typeof data['channel_0'] !== 'undefined') {
			const action = data['channel_0'];
			this.debug('Action performed:', action);
			this.emit('action', {
				id: action
			});
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
