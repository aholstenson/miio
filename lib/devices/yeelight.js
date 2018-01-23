'use strict';

const { Thing, Nameable } = require('abstract-things');
const { Light, Fading, Colorable, ColorTemperature, ColorFull } = require('abstract-things/lights');
const { color } = require('abstract-things/values');
const MiioApi = require('../device');

const Power = require('./capabilities/power');
const Dimmable = require('./capabilities/dimmable');

const DEFAULT_EFFECT = 'smooth';
const DEFAULT_DURATION = 500;

const Yeelight = Thing.type(Parent => class Yeelight extends Parent
	.with(Light, Fading, MiioApi, Power, Dimmable, Nameable)
{
	static get type() {
		return 'miio:yeelight';
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

		// Used for scheduling turning off after a while
		this.defineProperty('delayoff', {
			name: 'offDelay',
			mapper: parseInt
		});

		// Query for the color mode
		this.defineProperty('color_mode', {
			name: 'colorMode',
			mapper: v => {
				v = parseInt(v);
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

		// Read the name of the light
		this.defineProperty('name');

		/*
		 * Set maximum fade time to 30s - seems to work well, longer values
		 * sometimes cause jumps on certain models.
		 */
		this.updateMaxChangeTime('30s');
	}

	propertyUpdated(key, value) {
		if(key === 'name') {
			this.metadata.name = value;
		}

		super.propertyUpdated(key, value);
	}

	changePower(power) {
		// TODO: Support for duration
		return this.call(
			'set_power',
			Yeelight.withEffect(power ? 'on' : 'off'),
			{
				refresh: [ 'power']
			}
		).then(MiioApi.checkOk);
	}

	/**
	 * Make the current state the default state, meaning the light will restore
	 * to this state after power has been cut.
	 */
	setDefault() {
		return this.call('set_default')
			.then(MiioApi.checkOk);
	}

	changeBrightness(brightness, options) {
		if(brightness <= 0) {
			return this.changePower(false);
		} else {
			let promise;
			if(options.powerOn && this.power() === false) {
				// Currently not turned on
				promise = this.changePower(true);
			} else {
				promise = Promise.resolve();
			}

			return promise.then(() =>
				this.call(
					'set_bright',
					Yeelight.withEffect(brightness, options.duration), {
					refresh: [ 'brightness' ]
				})
			).then(MiioApi.checkOk);
		}
	}

	changeName(name) {
		return this.call('set_name', [ name ])
			.then(MiioApi.checkOk)
			.then(() => this.metadata.name = name);
	}

	/**
	 * Helper method to combine an argument with effect information.
	 */
	static withEffect(arg, duration) {
		const result = Array.isArray(arg) ? arg : [ arg ];

		if(duration) {
			if(duration.ms > 0) {
				result.push(DEFAULT_EFFECT);
				result.push(duration.ms);
			} else {
				result.push('sudden');
				result.push(0);
			}
		} else {
			result.push(DEFAULT_EFFECT);
			result.push(DEFAULT_DURATION);
		}

		return result;
	}
});

module.exports.Yeelight = Yeelight;

module.exports.ColorTemperature = Thing.mixin(Parent => class extends Parent
	.with(MiioApi, Colorable, ColorTemperature)
{

	constructor(...args) {
		super(...args);

		// Color temperature
		this.defineProperty('ct', {
			name: 'colorTemperature',
			mapper: parseInt
		});

		// TODO: Do all Yeelights use the same color range?
		this.updateColorTemperatureRange(2700, 6500);
	}

	propertyUpdated(key, value) {
		if(key === 'colorTemperature') {
			this.updateColor(color.temperature(value));
		}

		super.propertyUpdated(key, value);
	}

	changeColor(color, options) {
		const range = this.colorTemperatureRange;
		const temperature = Math.min(Math.max(color.temperature.kelvins, range.min), range.max);

		return this.call('set_ct_abx', Yeelight.withEffect(temperature, options.duration), {
			refresh: [ 'colorTemperature' ]
		}).then(MiioApi.checkOk);
	}
});

module.exports.ColorFull = Thing.mixin(Parent => class extends Parent
	.with(MiioApi, Colorable, ColorTemperature, ColorFull)
{

	constructor(...args) {
		super(...args);

		// Color temperature
		this.defineProperty('ct', {
			name: 'colorTemperature',
			mapper: parseInt
		});

		this.defineProperty('rgb', {
			name: 'colorRGB',
			mapper: rgb => {
				rgb = parseInt(rgb);

				return {
					red: (rgb >> 16) & 0xff,
					green: (rgb >> 8) & 0xff,
					blue: rgb & 0xff
				};
			}
		});

		this.defineProperty('hue', {
			name: 'colorHue',
			mapper: parseInt
		});

		this.defineProperty('sat', {
			name: 'colorSaturation',
			mapper: parseInt
		});

		this.metadata.addCapabilities('color:temperature', 'color:full');

		// TODO: Do all Yeelights use the same color range?
		this.updateColorTemperatureRange(2700, 6500);
	}

	propertyUpdated(key, value) {
		if(key === 'colorTemperature' || key === 'colorMode' || key === 'colorRGB' || key === 'colorHue' || key === 'colorSaturation' || key === 'brightness') {
			let currentColor = this.color();
			switch(this.property('colorMode')) {
				case 'colorTemperature':
					// Currently using color temperature mode, parse as temperature
					currentColor = color.temperature(this.property('colorTemperature'));
					break;
				case 'rgb': {
					// Using RGB, parse if we have gotten the RGB value
					let rgb = this.property('colorRGB');
					if(rgb) {
						currentColor = color.rgb(rgb.red, rgb.green, rgb.blue);
					}
					break;
				}
				case 'hsv': {
					// Using HSV, parse the hue, saturation and get the brightness to set color
					let hue = this.property('colorHue');
					let saturation = this.property('colorSaturation');

					if(typeof hue !== 'undefined' && typeof saturation !== 'undefined') {
						currentColor = color.hsv(hue, saturation, this.property('brightness'));
					}
				}
			}

			this.updateColor(currentColor);
		}

		super.propertyUpdated(key, value);
	}

	changeColor(color, options) {
		if(color.is('temperature')) {
			// The user has request a color via temperature

			const range = this.colorTemperatureRange;
			const temperature = Math.min(Math.max(color.temperature.kelvins, range.min), range.max);

			return this.call('set_ct_abx', Yeelight.withEffect(temperature, options.duration), {
				refresh: [ 'colorTemperature', 'colorMode' ]
			}).then(MiioApi.checkOk);
		} else if(color.is('hsl')) {
			/*
			 * User has requested hue and saturation
			 */
			return this.call('set_hsv', Yeelight.withEffect([ color.hue, color.saturation ], options.duration), {
				refresh: [ 'colorHue', 'colorSaturation', 'colorMode' ]
			}).then(MiioApi.checkOk);
		} else {
			/*
			 * Fallback to applying via RGB.
			 */
			color = color.rgb;

			const rgb = color.red * 65536 + color.green * 256 + color.blue;
			return this.call('set_rgb', Yeelight.withEffect(rgb, options.duration), {
				refresh: [ 'colorRGB', 'colorMode' ]
			}).then(MiioApi.checkOk);
		}
	}
});
