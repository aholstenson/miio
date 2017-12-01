'use strict';

const SubDevice = require('./subdevice');
const { Controller } = require('abstract-things/controllers');

module.exports = class Switch extends SubDevice.with(Controller) {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'controller';
		this.model = 'lumi.switch';

		this.updateActions([
			'click',
			'double_click',
			'long_click_press',
			'long_click_release'
		]);
	}

	_report(data) {
		super._report(data);

		if(typeof data.status !== 'undefined') {
			this.debug('Action performed:', data.status);
			this.emitAction(data.status);
		}
	}
};
