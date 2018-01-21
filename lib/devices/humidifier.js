'use strict';

const { EasyNameable } = require('abstract-things');
const { Humidifier } = require('abstract-things/climate');

const MiioApi = require('../device');

const Power = require('./capabilities/power');
const Mode = require('./capabilities/mode');
const Buzzer = require('./capabilities/buzzer');
const { Temperature, Humidity } = require('./capabilities/sensor');

/**
 * Abstraction over a Mi Humidifier.
 *
 */
module.exports = class extends Humidifier
	.with(EasyNameable, MiioApi, Power, Mode, Temperature, Humidity,
		Buzzer)
{
	static get type() {
		return 'miio:humidifier';
	}

	constructor(options) {
		super(options);

		this.defineProperty('power', v => v === 'on');

		// Set the mode property and supported modes
		this.defineProperty('mode');
		this.updateModes([
			'silent',
			'medium',
			'high'
		]);

		// Sensor values reported by the device
		this.defineProperty('temp_dec', {
			name: 'temperature',
			mapper: v => v / 10.0
		});

		this.defineProperty('humidity');

		// Buzzer and beeping
		this.defineProperty('buzzer', {
			mapper: v => v === 'on'
		});

		this.defineProperty('led_b', {
			name: 'ledBrightness',
			mapper: v => {
				switch(v) {
					case 0:
						return 'bright';
					case 1:
						return 'dim';
					case 2:
						return 'off';
					default:
						return 'unknown';
				}
			}
		});
	}

	changePower(power) {
		return this.call('set_power', [ power ? 'on' : 'off' ], {
			refresh: [ 'power', 'mode' ],
			refreshDelay: 200
		});
	}

	/**
	 * Set the mode of this device.
	 */
	changeMode(mode) {
		return this.call('set_mode', [ mode ], {
			refresh: [ 'power', 'mode' ],
			refreshDelay: 200
		})
			.then(MiioApi.checkOk)
			.catch(err => {
				throw err.code === -5001 ? new Error('Mode `' + mode + '` not supported') : err;
			});
	}

	/**
	 * Set the LED brightness to either `bright`, `dim` or `off`.
	 */
	changeLEDBrightness(level) {
		switch(level) {
			case 'bright':
				level = 0;
				break;
			case 'dim':
				level = 1;
				break;
			case 'off':
				level = 2;
				break;
			default:
				return Promise.reject(new Error('Invalid LED brigthness: ' + level));
		}
		return this.call('set_led_b', [ level ], { refresh: [ 'ledBrightness' ] })
			.then(() => null);
	}
};
