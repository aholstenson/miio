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

	get mode() {
		return this.property('mode');
	}

	setMode(mode) {
		return this.call('set_mode', [ mode ]);
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
