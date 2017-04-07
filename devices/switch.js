'use strict';

const Device = require('../device');

class Switch extends Device {
	static get TYPE() { return 'switch' };

	constructor(options) {
		super(options);

		this.type = Switch.TYPE;

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
