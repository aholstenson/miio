'use strict';

const Device = require('../device');
const Power = require('./capabilities/power');
const Sensor = require('./capabilities/sensor');

/**
 * Abstraction over a Mi Humidifier.
 *
 */
class Humidifier extends Device {
	static get TYPE() { return 'humidifier' }

	constructor(options) {
		super(options);

		this.type = Humidifier.TYPE;

		this.defineProperty('power', v => v === 'on');
		Power.extend(this, {
			set: (power) => this.call('set_power', [ power ? 'on' : 'off' ], {
				refresh: [ 'power', 'mode' ],
				refreshDelay: 200
			})
		});

		this.capabilities.push('mode');
		this.defineProperty('mode');

		// Sensor values reported by the device
		this.defineProperty('temp_dec', {
			name: 'temperature',
			mapper: v => v / 10.0
		});
		Sensor.extend(this, { name : 'temperature' });

		this.defineProperty('humidity');
		Sensor.extend(this, { name : 'humidity' });

		// Buzzer and beeping
		this.defineProperty('buzzer', {
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
	}

	/**
	 * Get the mode that the device is in.
	 */
	get mode() {
		return this.property('mode');
	}

	/**
	 * Get the modes that are available to set.
	 */
	get modes() {
		return [ 'silent', 'medium', 'high' ];
	}

	/**
	 * Set the mode of this device.
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

module.exports = Humidifier;
