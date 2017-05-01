'use strict';

const Device = require('../device');
const Power = require('./capabilities/power');
const Sensor = require('./capabilities/sensor');

/**
 * Abstraction over a Mi Air Purifier.
 *
 * Air Purifiers have a mode that indicates if is on or not. Changing the mode
 * to `idle` will power off the device, all other modes will power on the
 * device.
 */
class AirPurifier extends Device {
	static get TYPE() { return 'air-purifier' }

	constructor(options) {
		super(options);

		this.type = AirPurifier.TYPE;

		// Properties related to if the device is on and in which mode
		this.defineProperty('power', v => v === 'on');
		Power.extend(this, {
			set: (power) => this.call('set_power', [ power ? 'on' : 'off' ], {
				refresh: [ 'power', 'mode' ],
				refreshDelay: 200
			})
		});

		this.capabilities.push('mode');
		this.defineProperty('mode');
		this.defineProperty('favorite_level', {
			name: 'favoriteLevel'
		});

		// Sensor values reported by the device
		this.defineProperty('temp_dec', {
			name: 'temperature',
			mapper: v => v / 10.0
		});
		Sensor.extend(this, { name : 'temperature' });

		this.defineProperty('humidity');
		Sensor.extend(this, { name : 'humidity' });

		this.defineProperty('aqi');
		Sensor.extend(this, { name : 'aqi' });

		this.defineProperty('bright');

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

		// LED state
		this.defineProperty('led', {
			mapper: v => v == 'on'
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
			mapper: v => v == 'on'
		});
	}

	/**
	 * Get the mode that the device is in.
	 */
	get mode() {
		return this.property('mode');
	}

	/**
	 * Get the modes that are available to set.
	 *
	 * TODO: Does this change with the model?
	 */
	get modes() {
		return [
			'idle',

			'auto',
			'silent',
			'favorite'
		];
	}

	/**
	 * Set the mode of the device. Setting this to `idle` will power off the
	 * device and any other supported mode will power it on.
	 */
	setMode(mode) {
		return this.call('set_mode', [ mode ], {
			refresh: [ 'power', 'mode' ],
			refreshDelay: 200
		})
			.then(Device.checkOk)
			.catch(err => {
				throw err.code == -5001 ? new Error('Mode `' + mode + '` not supported') : err
			});
	}

	/**
	 * Get the favorite level used when the mode is `favorite`. Between 0 and 16.
	 */
	get favoriteLevel() {
		return this.property('favoriteLevel');
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
	 * Get if the LED is on when the device is running.
	 */
	get led() {
		return this.property('led');
	}

	/**
	 * Set if the LED should be on when the device is running.
	 */
	setLed(power) {
		return this.call('set_led', [ power ? 'on' : 'off' ], { refresh: true })
			.then(() => null);
	}

	/**
	 * Get the current LED brightness, either `bright`, `dim` or `off`.
	 */
	get ledBrightness() {
		return this.property('ledBrightness');
	}

	/**
	 * Set the LED brightness to either `bright`, `dim` or `off`.
	 */
	setLedBrightness(level) {
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
		return this.call('set_led_b', [ level ], { refresh: true })
			.then(() => null);
	}

	/**
	 * Get if the buzzer on the device is active, where it will beep whenever
	 * a command is performed.
	 */
	get buzzer() {
		return this.property('buzzer');
	}

	/**
	 * Set if the device should beep whenever a command is performed.
	 */
	setBuzzer(active) {
		return this.call('set_buzzer', [ active ? 'on' : 'off' ], { refresh: true })
			.then(() => null);
	}
}

module.exports = AirPurifier;
