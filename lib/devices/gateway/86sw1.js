'use strict';

const SubDevice = require('./subdevice');
const { WallController, Actions } = require('abstract-things/controllers');

module.exports = class Switch1 extends SubDevice.with(WallController, Actions) {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'controller';
		this.miioModel = 'lumi.86sw1';

		this.updateActions([
			'click',
			'double_click'
		]);
	}

	_report(data) {
		super._report(data);

		if(typeof data['channel_0'] !== 'undefined') {
			const action = data['channel_0'];
			this.debug('Action performed:', action);
			this.emitAction(action);
		}
	}
};
