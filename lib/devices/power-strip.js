'use strict';

const { PowerStrip } = require('abstract-things/electrical');

const MiioApi = require('../device');
const Power = require('./capabilities/power');
const Mode = require('./capabilities/mode');

module.exports = class extends PowerStrip
	.with(MiioApi, Power, Mode)
{
	static get type() {
		return 'miio:power-strip';
	}

	constructor(options) {
		super(options);

		this.defineProperty('power', {
			mapper: v => v === 'n'
		});

		this.updateModes([
			'green',
			'normal'
		]);

		this.defineProperty('mode');
	}

	changePower(power) {
		return this.call('set_power', [ power ? 'on' : 'off' ], { refresh: [ 'power' ] });
	}

	changeMode(mode) {
		return this.call('set_power_mode', [ mode ]);
	}
};
