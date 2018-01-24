'use strict';

const { LightBulb, Colorable, ColorTemperature } = require('abstract-things/lights');
const { color } = require('abstract-things/values');
const MiioApi = require('../device');

const Power = require('./capabilities/power');
const Dimmable = require('./capabilities/dimmable');

const MIN_TEMP = 3000;
const MAX_TEMP = 5700;

module.exports = class BallLamp extends LightBulb
	.with(MiioApi, Power, Dimmable, Colorable, ColorTemperature)
{
	static get type() {
		return 'miio:philiphs-ball-lamp';
	}

	constructor(options) {
		super(options);

		this.defineProperty('power', {
			name: 'power',
			mapper: v => v === 'on'
		});

		this.defineProperty('bright', {
			name: 'brightness',
			mapper: parseInt
		});

		this.defineProperty('cct', {
			name: 'colorTemperature',
			mapper: v => {
				v = parseInt(v);
				return color.temperature(MIN_TEMP + (v / 100) * (MAX_TEMP - MIN_TEMP));
			}
		});

		this.updateColorTemperatureRange(MIN_TEMP, MAX_TEMP);
	}

	updatePower(power) {
		return this.call('set_power', [ power ? 'on' : 'off' ], {
			refresh: [ 'power' ]
		});
	}

	changeBrightness(brightness) {
		return this.call('set_bright', [ brightness ], {
			refresh: [ 'brightness' ]
		}).then(MiioApi.checkOk);
	}

	changeColor(color) {
		const kelvins = color.temperature.kelvins;
		let temp;
		if(kelvins <= MIN_TEMP) {
			temp = 0;
		} else if(kelvins >= MAX_TEMP) {
			temp = 100;
		} else {
			temp = Math.round((kelvins - MIN_TEMP) / (MAX_TEMP - MIN_TEMP) * 100);
		}

		return this.call('set_cct', [ temp ], {
			refresh: [ 'colorTemperature ']
		}).then(MiioApi.checkOk);
	}

};
