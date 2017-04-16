

const SubDevice = require('./subdevice');

const PowerChannels = require('../capabilities/power-channels');

/**
 * Dual-channel light switch.
 */
class CtrlNeutral2 extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'switch';
		this.model = 'lumi.ctrl_neutral2';

		this.defineProperty('channel_0', {
			name: 'powerChannel0',
			mapper: v => v == 'on'
		});
		this.defineProperty('channel_1', {
			name: 'powerChannel1',
			mapper: v => v == 'on'
		});
		PowerChannels.extend(this, {
			channels: 2,
			set: (channel, power) => this.call('toggle_ctrl_neutral', [ 'neutral_' + channel, power ? 'on' : 'off' ])
		});
	}
}

module.exports = CtrlNeutral2;
