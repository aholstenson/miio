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

	get serviceMapping() {
		return {
			power: { siid: 2, piid: 2 },
			mode: { 
				siid: 2, 
				piid: 5, 
				mapping: (mode) => {
					switch (mode) {
						case 'auto': return 0;
						case 'sleep': return 1;
						case 'favorite': return 2;
						case 'idle:': return 3;
						default:
							return 0;

					}
				} 
			},
			temp_dec: { siid: 3, piid: 8 },
			humidity: { siid: 3, piid: 7 },
			aqi: { siid: 3, piid: 6 },
			favorite_level: {
				siid: 10, 
				piid: 10,
				mapping: (level) => {
					return Math.round(level/16*14);
				}
			},
			filter1_life: { siid: 4, piid: 3 },
			f1_hour_used: { siid: 4, piid: 5 },
			use_time: { siid: 12, piid: 1 },
			led: { siid: 6, piid: 6},
			led_b: { siid: 6, piid: 1 },
			buzzer: { siid: 5, piid: 1 }
		};
	}

	getServiceProperty(prop) {
		return { 
			did: String(this.handle.api.id),
			siid: this.serviceMapping[prop].siid,
			piid: this.serviceMapping[prop].piid
		};
	}

	static get type() {
		return 'miio:air-purifier';
	}

	loadProperties(props) {
		// Rewrite property names to device internal ones
		props = props.map(key => this._reversePropertyDefinitions[key] || key);

		const propObjects = props.filter(prop => this.serviceMapping[prop]).map(this.getServiceProperty.bind(this));

		return this.call('get_properties', propObjects).then(result => {
			const obj = {};
			for(let i=0; i<result.length; i++) {
				this._pushProperty(obj, props[i], result[i].value);
			}
			return obj;
		});
	}

	constructor(options) {
		super(options);

		// Define the power property
		this.defineProperty('power');

		// Set the mode property and supported modes
		this.defineProperty('mode', {
			mapper: v => {
				switch(v) {
					case 0: return 'auto';
					case 1: return 'silent';
					case 2: return 'favorite';
					case 3: return 'idle';
				}
			}
		});
		this.updateModes([
			'idle',
			'auto',
			'silent',
			'favorite'
		]);

		// Sensor value for Temperature capability
		this.defineProperty('temp_dec', {
			name: 'temperature'
		});

		// Sensor value for RelativeHumidity capability
		this.defineProperty('humidity');

		// Sensor value used for AQI (PM2.5) capability
		this.defineProperty('aqi');

		// The favorite level
		this.defineProperty('favorite_level', {
			name: 'favoriteLevel',
			mapper: v => Math.round(v/14*16)
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
		this.defineProperty('led');

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
		this.defineProperty('buzzer');
	}

	changePower(power) {
		const attributes = [];

		if (!power) {
			// change mode to idle when turning off
			attributes.push(Object.assign(this.getServiceProperty('mode'), { value: 3 }));
		}

		attributes.push(Object.assign({ value: power }, this.getServiceProperty('power')));

		return this.call('set_properties', attributes, {
			refresh: [ 'power', 'mode' ],
			refreshDelay: 200
		});
	}

	/**
	 * Perform a mode change as requested by `mode(string)` or
	 * `setMode(string)`.
	 */
	changeMode(mode) {
		const realMode = this.serviceMapping['mode'].mapping(mode);

		return this.call('set_properties', [ Object.assign({ value: realMode }, this.getServiceProperty('mode')) ], {
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
		const realFavoriteLevel = this.serviceMapping['favorite_level'].mapping(level);

		return this.call('set_properties', [ Object.assign({ value: realFavoriteLevel }, this.getServiceProperty('favorite_level')) ])
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

		return this.call('set_properties', [ Object.assign({ value: level }, this.getServiceProperty('led_b')) ])
			.then(() => null);
	}
};
