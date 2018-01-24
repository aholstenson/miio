'use strict';

const { SwitchableMode } = require('abstract-things');
const { Humidifier, AdjustableTargetHumidity } = require('abstract-things/climate');

const MiioApi = require('../device');

const Power = require('./capabilities/power');
const Buzzer = require('./capabilities/buzzer');
const LEDBrightness = require('./capabilities/changeable-led-brightness');
const { Temperature, Humidity } = require('./capabilities/sensor');

/**
 * Abstraction over a Mi Humidifier.
 *
 */
module.exports = class extends Humidifier
	.with(MiioApi, Power, SwitchableMode,
		AdjustableTargetHumidity, Temperature, Humidity,
		Buzzer, LEDBrightness)
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
			'idle',
			'silent',
			'medium',
			'high'
		]);

		// Humidity limit
		this.defineProperty('limit_hum', {
			name: 'targetHumidity',
		});

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

	propertyUpdated(key, value) {
		/*
		 * Emulate that the humidifier has an idle mode.
		 */
		if(key === 'power') {
			if(value) {
				const mode = this.property('mode');
				this.updateMode(mode);
			} else {
				this.updateMode('idle');
			}
		} else if(key === 'mode') {
			const power = this.property('power');
			if(power) {
				this.updateMode(value);
			} else {
				this.updateMode('idle');
			}
		} else if(key === 'targetHumidity') {
			this.updateTargetHumidity(value);
		}

		super.propertyUpdated(key, value);
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
		let promise;
		if(mode === 'idle') {
			return this.setPower(false);
		} else {
			if(this.power()) {
				// Already powered on, do nothing
				promise = Promise.resolve();
			} else {
				// Not powered on, power on
				promise = this.setPower(true);
			}
		}

		return promise.then(() => {
			return this.call('set_mode', [ mode ], {
				refresh: [ 'power', 'mode' ],
				refreshDelay: 200
			})
				.then(MiioApi.checkOk)
				.catch(err => {
					throw err.code === -5001 ? new Error('Mode `' + mode + '` not supported') : err;
				});
		});
	}

	changeTargetHumidity(humidity) {
		return this.call('set_limit_hum', [ humidity ], {
			refresh: [ 'targetHumidity' ]
		}).then(MiioApi.checkOk);
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
