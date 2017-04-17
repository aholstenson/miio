
const Switch = require('./switch');

class PowerStrip extends Switch {
	constructor(options) {
		super(options);

		this.capabilities.push('mode');
		this.defineProperty('mode');
	}


	get modes() {
		return [ 'green', 'normal' ];
	}

	get mode() {
		return this.property('mode');
	}

	setMode(mode) {
		return this.call('set_power_mode', [ mode ])
			.then(() => mode);
	}
}

module.exports = PowerStrip;
