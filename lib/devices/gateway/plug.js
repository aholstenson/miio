'use strict';


const SubDevice = require('./subdevice');

const PowerChannels = require('../capabilities/power-channels');

/**
 * Wall plug. Can be turned on or off.
 */
class Plug extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'power-plug';
		this.model = 'lumi.plug';

		this.defineProperty('status', {
			name: 'powerChannel0',
			mapper: v => v == 'on'
		});
		PowerChannels.extend(this, {
			channels: [ 0 ],
			set: (channel, power) => this.call('toggle_plug', [ 'neutral_' + channel, power ? 'on' : 'off' ])
		});

		this.defineProperty('load_voltage', {
			name: 'loadVoltage',
			mapper: parseInt
		});
		this.defineProperty('load_power', {
			name: 'loadPower',
			mapper: parseInt
		});
		this.defineProperty('power_consumed', {
			name: 'powerConsumed',
			mapper: parseFloat
		});

		this.capabilities.push('power-load');
		this.capabilities.push('power-usage');
	}

	get loadVoltage() {
		return this.property('loadVoltage');
	}

	get loadPower() {
		return this.property('loadPower');
	}

	get powerConsumed() {
		return this.property('powerConsumed');
	}
}

module.exports = Plug;
