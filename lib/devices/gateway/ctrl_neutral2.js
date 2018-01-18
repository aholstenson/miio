'use strict';

const { Children } = require('abstract-things');
const { WallSwitch } = require('abstract-things/electrical');

const SubDevice = require('./subdevice');
const LightChannel = require('./light-channel');

/**
 * Dual-channel light switch.
 */
module.exports = class CtrlNeutral2 extends WallSwitch.with(SubDevice, Children) {

	static get type() {
		return 'miio:power-switch';
	}

	constructor(parent, info) {
		super(parent, info);

		this.miioModel = 'lumi.ctrl_neutral2';

		this.defineProperty('channel_0', {
			name: 'powerChannel0',
			mapper: v => v === 'on'
		});
		this.defineProperty('channel_1', {
			name: 'powerChannel1',
			mapper: v => v === 'on'
		});

		this.addChild(new LightChannel(this, 0));
		this.addChild(new LightChannel(this, 1));
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
			case 'powerChannel1':
				this.child('1').updatePower(value);
				break;
		}
	}
};

