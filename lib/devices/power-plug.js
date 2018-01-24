'use strict';

const { Thing } = require('abstract-things');
const { PowerPlug, PowerOutlet } = require('abstract-things/electrical');
const MiioApi = require('../device');
const Power = require('./capabilities/power');

module.exports = class extends Thing
	.with(PowerPlug, PowerOutlet, MiioApi, Power)
{
	static get type() {
		return 'miio:power-plug';
	}

	constructor(options) {
		super(options);

		this.defineProperty('power', {
			mapper: v => v === 'on'
		});
	}

	changePower(power) {
		return this.call('set_power', [ power ? 'on' : 'off' ], { refresh: [ 'power' ] });
	}
};
