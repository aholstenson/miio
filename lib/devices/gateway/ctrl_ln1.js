'use strict';



const SubDevice = require('./subdevice');

const PowerChannels = require('../capabilities/power-channels');

/**
 * Single-channel L-N version of light switch.
 */
class CtrlLN1 extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'power-switch';
		this.model = 'lumi.ctrl_ln1';

		this.defineProperty('channel_0', {
			name: 'powerChannel0',
			mapper: v => v == 'on'
		});
		PowerChannels.extend(this, {
			channels: [ 0 ],
			set: (channel, power) => this.call('toggle_ctrl_neutral', [ 'neutral_' + channel, power ? 'on' : 'off' ])
		});
	}
}

module.exports = CtrlLN1;
