'use strict';

const Device = require('../device');

const PowerChannels = require('./capabilities/power-channels');

class Outlet extends Device {
	static get TYPE() { return 'outlet' }

	constructor(options) {
		super(options);

		this.type = Outlet.TYPE;

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

module.exports = Outlet;
