'use strict';

const Device = require('../device');

const PowerChannels = require('./capabilities/power-channels');

class PowerStrip extends Device {
	static get TYPE() { return 'power-strip' }

	constructor(options) {
		super(options);

		this.type = PowerStrip.TYPE;

		this.defineProperty('power', {
			name: 'powerChannel0',
			mapper: v => v === 'on'
		});
		PowerChannels.extend(this, {
			channels: [ 0 ],
			set: (channel, power) => this.call('set_power', [ power ? 'on' : 'off' ], { refresh: true })
		});

		this.capabilities.push('mode');
		this.defineProperty('mode');
	}


	get modes() {
		return [ 'green', 'normal' ];
	}

	get mode() {
		return this.property('mode');
	}

	setMode(mode) {
		return this.call('set_power_mode', [ mode ])
			.then(() => mode);
	}
}

module.exports = PowerStrip;
