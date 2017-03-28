'use strict';

const Device = require('../device');

class Switch extends Device {
	constructor(options) {
		super(options);

		this.type = 'switch';

		this.defineProperty('power', v => v === 'on');

		this.monitor();
	}

	get power() {
		return this.property('power');
	}
}

module.exports = Switch;
