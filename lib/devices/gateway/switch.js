'use strict';

const SubDevice = require('./subdevice');
const { Button, Actions } = require('abstract-things/controllers');
const Voltage = require('./voltage');

module.exports = class Switch extends SubDevice.with(Button, Actions, Voltage) {
	constructor(parent, info) {
		super(parent, info);

		this.miioModel = 'lumi.switch';

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
