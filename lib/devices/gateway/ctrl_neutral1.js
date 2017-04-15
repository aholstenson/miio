

const SubDevice = require('./subdevice');

/**
 * Single-channel light switch.
 */
class CtrlNeutral1 extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'switch';
		this.model = 'lumi.ctrl_neutral1';

		this.defineProperty('channel_0', {
			name: 'channel0',
			mapper: v => v == 'on'
		});
	}

	get channels() {
		return 1;
	}

	/**
	 * Get if this this device is powered on.
	 */
	get power() {
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

		return this.call('toggle_ctrl_neutral', [ 'channel_' + channel, power ? 'on' : 'off' ])
			.then(() => power);
	}
}

module.exports = CtrlNeutral1;
