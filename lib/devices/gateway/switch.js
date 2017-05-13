'use strict';


const SubDevice = require('./subdevice');

class Switch extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'controller';
		this.model = 'lumi.switch';
	}

	_report(data) {
		super._report(data);

		if(typeof data.status !== 'undefined') {
			this.debug('Action performed:', data.status);
			this.emit('action', {
				id: data.status
			});
		}
	}

	get actions() {
		return [
			'click',
			'double_click',
			'long_click_press',
			'long_click_release'
		];
	}
}

module.exports = Switch;
