'use strict';

const Device = require('../device');

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
		this.defineProperty('mode');

		// Sensor values reported by the device
		this.defineProperty('temp_dec', {
			name: 'temperature',
			mapper: v => v / 10.0
		});
		this.defineProperty('aqi');
		this.defineProperty('humidity');

		this.monitor();
	}

	/**
	 * Get if the device is powered on or not.
	 */
	get power() {
		return this.property('power');
	}

	/**
	 * Switch the power of the device, either turning it off or turning it on
	 * in the last mode used.
	 */
	setPower(on) {
		return this.call('set_power', [ on ? 'on' : 'off '], {
			refresh: true
		})
			.then(() => on);
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
		return [ 'idle', 'auto', 'silent', 'low', 'medium', 'high' ];
	}

	/**
	 * Set the mode of the device. Setting this to `idle` will power off the
	 * device and any other supported mode will power it on.
	 */
	setMode(mode) {
		return this.call('set_mode', [ mode ], {
			refresh: true
		})
			.then(res => res[0] == 'ok' ? true : false)
			.catch(err => {
				throw err.code == -5001 ? new Error('Mode `' + mode + '` not supported') : err
			});
	}

	/**
	 * Get the current reported temperature in degrees Celsius.
	 */
	get temperature() {
		return this.property('temperature');
	}

	/**
	 * Get the relative humidity reported by the device.
	 */
	get humidity() {
		return this.property('humidity');
	}

	/**
	 * Get the calculated Air Quality Index (PM2.5 sensor).
	 */
	get aqi() {
		return this.property('aqi');
	}
}

module.exports = AirPurifier;
