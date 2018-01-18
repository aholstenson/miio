'use strict';


const { PowerPlug, PowerOutlet } = require('abstract-things/electrical');

const SubDevice = require('./subdevice');
const Power = require('../capabilities/power');
const { PowerLoad, PowerConsumed } = require('../capabilities/sensor');

/**
 * Wall plug. Can be turned on or off.
 */
module.exports = class Plug extends SubDevice
	.with(PowerPlug, PowerOutlet, Power, PowerLoad, PowerConsumed)
{

	constructor(parent, info) {
		super(parent, info);

		this.miioModel = 'lumi.plug';

		this.defineProperty('status', {
			name: 'power',
			mapper: v => v === 'on'
		});

		this.defineProperty('load_voltage', {
			name: 'loadVoltage',
			mapper: parseInt
		});
		this.defineProperty('load_power', {
			name: 'powerLoad',
			mapper: parseInt
		});
		this.defineProperty('power_consumed', {
			name: 'powerConsumed',
			mapper: parseFloat
		});
	}

	changePower(power) {
		return this.call('toggle_plug', [ 'neutral_0', power ? 'on' : 'off' ]);
	}

};
