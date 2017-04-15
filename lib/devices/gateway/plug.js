
const SubDevice = require('./subdevice');

/**
 * Wall plug. Can be turned on or off.
 */
class Plug extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'plug';
		this.model = 'lumi.plug';

		this.defineProperty('status', {
			name: 'power',
			mapper: v => v == 'on'
		});
		this.defineProperty('load_voltage', {
			name: 'loadVoltage',
			mapper: parseInt
		});
		this.defineProperty('load_power', {
			name: 'loadPower',
			mapper: parseInt
		});
		this.defineProperty('power_consumed', {
			name: 'power_consumed',
			mapper: parseFloat
		});
	}

	get channels() {
		return 1;
	}

	/**
	 * Get if this this device is powered on.
	 */
	power(channel) {
		if(channel != 0) return false;

		return this.property('power');
	}

	/**
	 * Set the power state of this device.
	 */
	setPower(channel, power) {
		if(typeof power === 'undefined') {
			power = channel;
			channel = 0;
		}
		return this.call('toggle_plug', [ 'neutral_' + channel, power ? 'on' : 'off' ])
			.then(() => power);
	}

	get loadVoltage() {
		return this.property('loadVoltage');
	}

	get loadPower() {
		return this.property('loadPower');
	}

	get powerConsumed() {
		return this.property('powerConsumed');
	}
}

module.exports = Plug;
