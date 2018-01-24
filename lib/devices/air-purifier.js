'use strict';

const { AirPurifier } = require('abstract-things/climate');
const MiioApi = require('../device');

const Power = require('./capabilities/power');
const Mode = require('./capabilities/mode');
const SwitchableLED = require('./capabilities/switchable-led');
const LEDBrightness = require('./capabilities/changeable-led-brightness');
const Buzzer = require('./capabilities/buzzer');
const { Temperature, Humidity, AQI } = require('./capabilities/sensor');

/**
 * Abstraction over a Mi Air Purifier.
 *
 * Air Purifiers have a mode that indicates if is on or not. Changing the mode
 * to `idle` will power off the device, all other modes will power on the
 * device.
 */
module.exports = class extends AirPurifier
	.with(MiioApi, Power, Mode, Temperature, Humidity, AQI,
		SwitchableLED, LEDBrightness, Buzzer)
{

	static get type() {
		return 'miio:air-purifier';
	}

	constructor(options) {
		super(options);

		// Define the power property
		this.defineProperty('power', v => v === 'on');

		// Set the mode property and supported modes
		this.defineProperty('mode');
		this.updateModes([
			'idle',

			'auto',
			'silent',
			'favorite'
		]);

		// Sensor value for Temperature capability
		this.defineProperty('temp_dec', {
			name: 'temperature',
			mapper: v => v / 10.0
		});

		// Sensor value for RelativeHumidity capability
		this.defineProperty('humidity');

		// Sensor value used for AQI (PM2.5) capability
		this.defineProperty('aqi');

		// The favorite level
		this.defineProperty('favorite_level', {
			name: 'favoriteLevel'
		});

		// Info about usage
		this.defineProperty('filter1_life', {
			name: 'filterLifeRemaining'
		});
		this.defineProperty('f1_hour_used', {
			name: 'filterHoursUsed'
		});
		this.defineProperty('use_time', {
			name: 'useTime'
		});

		// State for SwitchableLED capability
		this.defineProperty('led', {
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

		// Buzzer and beeping
		this.defineProperty('buzzer', {
			mapper: v => v === 'on'
		});
	}

	changePower(power) {
		return this.call('set_power', [ power ? 'on' : 'off' ], {
			refresh: [ 'power', 'mode' ],
			refreshDelay: 200
		});
	}

	/**
	 * Perform a mode change as requested by `mode(string)` or
	 * `setMode(string)`.
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
	 * Get the favorite level used when the mode is `favorite`. Between 0 and 16.
	 */
	favoriteLevel(level=undefined) {
		if(typeof level === 'undefined') {
			return Promise.resolve(this.property('favoriteLevel'));
		}

		return this.setFavoriteLevel(level);
	}

	/**
	 * Set the favorite level used when the mode is `favorite`, should be
	 * between 0 and 16.
	 */
	setFavoriteLevel(level) {
		return this.call('set_level_favorite', [ level ])
			.then(() => null);
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
