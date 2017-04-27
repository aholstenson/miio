'use strict';

const Device = require('../device');

const PowerChannels = require('./capabilities/power-channels');

class Plug extends Device {
	static get TYPE() { return 'power-plug' }

	constructor(options) {
		super(options);

		this.type = Plug.TYPE;

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

module.exports = Plug;
