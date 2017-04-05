'use strict';

const Device = require('../device');

class AirPurifier extends Device {
	constructor(options) {
		super(options);

		this.type = 'air-purifier';

		this.defineProperty('power', v => v === 'on');
		this.defineProperty('mode');
		this.defineProperty('temp_dec', v => v / 10.0);
		this.defineProperty('aqi');
		this.defineProperty('humidity');

		this.monitor();
	}

	get power() {
		return this.property('power');
	}

	setPower(on) {
		return this.call('set_power', [ on ? 'on' : 'off '], {
			refresh: true
		})
			.then(() => on);
	}

	get mode() {
		return this.property('mode');
	}

	get modes() {
		return [ 'idle', 'auto', 'silent', 'low', 'medium', 'high' ];
	}

	setMode(mode) {
		return this.call('set_mode', [ mode ], {
			refresh: true
		})
			.then(res => res[0] == 'ok' ? true : false)
			.catch(err => {
				throw err.code == -5001 ? new Error('Mode `' + mode + '` not supported') : err
			});
	}

	get temperature() {
		return this.property('temp_dec');
	}

	get humidity() {
		return this.property('humidity');
	}

	get aqi() {
		return this.property('aqi');
	}
}

module.exports = AirPurifier;
