'use strict';

const Device = require('../device');

const Power = require('./capabilities/power');

class EyecareLamp2 extends Device {
	static get TYPE() {
		return 'light'
	}

	constructor(options) {
		super(options);

		this.type = EyecareLamp2.TYPE;

		this.defineProperty('power', {
			name: 'power',
			mapper: v => v === 'on'
		});

		Power.extend(this, {
			set: (channel, power) => this.call('set_power', [power ? 'on' : 'off'], {
				refresh: true
			})

		});
	}
}

module.exports = EyecareLamp2;
