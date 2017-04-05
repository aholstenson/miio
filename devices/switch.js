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

	setPower(on) {
		return this.call('set_power', [ on ? 'on' : 'off '], {
			refresh: true
		})
			.then(() => on);
	}
}

module.exports = Switch;
