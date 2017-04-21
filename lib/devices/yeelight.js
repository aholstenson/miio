'use strict';

const Device = require('../device');

const Power = require('./capabilities/power');

const DEFAULT_EFFECT = 'smooth';
const DEFAULT_DURATION = 500;

class Yeelight extends Device {
	static get TYPE() { return 'light' }

	constructor(options) {
		super(options);

		this.type = Yeelight.TYPE;

		this.defineProperty('power', {
			name: 'power',
			mapper: v => v === 'on'
		});
		Power.extend(this, {
			set: (power, options) => this.call(
				'set_power',
				Yeelight.withEffect(power ? 'on' : 'off', options),
				{ refresh: true }
			).then(Device.checkOk)
		});

		this.defineProperty('bright', {
			name: 'brightness',
			mapper: parseInt
		});
		this.capabilities.push('brightness');

		// Keep track of the color mode used by the light, seems to be available for all types of light
		this.defineProperty('color_mode', {
			name: 'colorMode',
			mapper: v => {
				switch(v) {
					case 1:
						return 'rgb';
					case 2:
						return 'colorTemperature';
					case 3:
						return 'hsv';
				}
			}
		});
		this.defineProperty('model');

		// Color temperature
		this.defineProperty('ct', {
			name: 'colorTemperature',
			mapper: parseInt
		});
		this.capabilities.push('color:temperature');

		// Used for scheduling turning off after a while
		this.defineProperty('delayoff', {
			name: 'offDelay',
			mapper: parseInt
		});
	}

	/**
	 * Make the current state the default state, meaning the light will restore
	 * to this state after power has been cut.
	 */
	setDefault() {
		return this.call('set_default')
			.then(Device.checkOk);
	}

	/**
	 * Get the current brightness of the light as a percentage between 0 and
	 * 100.
	 */
	get brightness() {
		return this.property('brightness');
	}

	/**
	 * Set the brightness of the device as a percentage between 0 and 100.
	 *
	 * Optionally include information about the the effect to use when
	 * changing brightness.
	 */
	setBrightness(brightness, options={}) {
		return this.call('set_bright', Yeelight.withEffect(brightness, options), {
			refresh: true
		}).then(Device.checkOk);
	}

	/**
	 * Get the current color mode. One of rgb, colorTemperature or hsv.
	 */
	get colorMode() {
		return this.property('colorMode');
	}

	/**
	 * Get the current color temperature of this light.
	 */
	get colorTemperature() {
		return this.property('colorTemperature');
	}

	/**
	 * Set the color temperature of this light.
	 */
	setColorTemperature(temperature, options={}) {
		return this.call('set_ct_abx', Yeelight.withEffect(temperature, options), {
			refresh: true
		}).then(Device.checkOk);
	}

	/**
	 * Helper method to combine an argument with effect information.
	 */
	static withEffect(arg, options) {
		const result = Array.isArray(arg) ? arg : [ arg ];

		if(options) {
			result.push(options.effect || DEFAULT_EFFECT);
			result.push(options.duration || DEFAULT_DURATION);
		} else {
			result.push(DEFAULT_EFFECT);
			result.push(DEFAULT_DURATION);
		}

		return result;
	}
}

module.exports = Yeelight;
