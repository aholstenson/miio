'use strict';

const { Children } = require('abstract-things');
const { WallSwitch } = require('abstract-things/electrical');

const SubDevice = require('./subdevice');
const LightChannel = require('./light-channel');

/**
 * Single-channel L-N version of light switch.
 */
module.exports = class CtrlLN1 extends WallSwitch.with(SubDevice, Children) {

	static get type() {
		return 'miio:power-switch';
	}

	constructor(parent, info) {
		super(parent, info);

		this.miioModel = 'lumi.ctrl_ln1';

		this.defineProperty('channel_0', {
			name: 'powerChannel0',
			mapper: v => v === 'on'
		});

		this.addChild(new LightChannel(this, 0));
	}

	changePowerChannel(channel, power) {
		return this.call('toggle_ctrl_neutral', [ 'neutral_' + channel, power ? 'on' : 'off' ]);
	}

	propertyUpdated(key, value) {
		super.propertyUpdated(key, value);

		switch(key) {
			case 'powerChannel0':
				this.child('0').updatePower(value);
				break;
		}
	}
};
