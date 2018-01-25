'use strict';

const SubDevice = require('./subdevice');
const { Button, Actions } = require('abstract-things/controllers');
const Voltage = require('./voltage');

module.exports = class Switch extends SubDevice.with(Button, Actions, Voltage) {
	constructor(parent, info) {
		super(parent, info);

		this.miioModel = 'lumi.switch.v2';

		this.updateActions([
			'click',
			'double_click'
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
