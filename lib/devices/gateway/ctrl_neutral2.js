

const SubDevice = require('./subdevice');

/**
 * Dual-channel light switch.
 */
class CtrlNeutral2 extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'switch';
		this.model = 'lumi.ctrl_neutral2';

		this.defineProperty('channel_0', {
			name: 'channel0',
			mapper: v => v == 'on'
		});
		this.defineProperty('channel_1', {
			name: 'channel1',
			mapper: v => v == 'on'
		});
	}

	get channels() {
		return 2;
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

			return Promise.all([
				this.call('toggle_ctrl_neutral', [ 'channel_0', power ? 'on' : 'off' ]),
				this.call('toggle_ctrl_neutral', [ 'channel_1', power ? 'on' : 'off' ])
			]);
		}

		return this.call('toggle_ctrl_neutral', [ 'channel_' + channel, power ? 'on' : 'off' ])
			.then(() => power);
	}
}

module.exports = CtrlNeutral2;
