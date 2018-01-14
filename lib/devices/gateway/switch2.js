'use strict';

const SubDevice = require('./subdevice');
const { Controller } = require('abstract-things/controllers');

module.exports = class Switch extends SubDevice.with(Controller) {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'controller';
		this.model = 'lumi.switch.v2';

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
