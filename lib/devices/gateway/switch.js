'use strict';


const SubDevice = require('./subdevice');

class Switch extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'controller';
		this.model = 'lumi.switch';

		this.defineProperty('voltage');
	}

	_report(info) {
		super._report(info);

		if(typeof info.data.status !== 'undefined') {
			this.debug('Action performed:', info.data.status);
			this.emit('action', {
				id: info.data.status
			});

			delete info.data.status;
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
