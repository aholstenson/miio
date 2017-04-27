'use strict';

const Device = require('../device');

const PowerChannels = require('./capabilities/power-channels');

class Switch extends Device {
	static get TYPE() { return 'power-switch' }

	constructor(options) {
		super(options);

		this.type = Switch.TYPE;

		this.defineProperty('power', {
			name: 'powerChannel0',
			mapper: v => v === 'on'
		});
		PowerChannels.extend(this, {
			channels: [ 0 ],
			set: (channel, power) => this.call('set_power', [ power ? 'on' : 'off' ], { refresh: true })
		});
	}

}

module.exports = Switch;
