'use strict';

const { Light, SwitchablePower } = require('abstract-things/lights');

/**
 * Representation of a power channel.
 */
module.exports = class LightChannel extends Light.with(SwitchablePower) {
	static get types() {
		return [ 'miio:subdevice', 'miio:power-channel', 'miio:light' ];
	}

	constructor(parent, channel) {
		super();

		this.id = parent.id + ':' + channel;

		this.parent = parent;
		this.channel = channel;

		this.updateName();
	}

	updateName() {
		this.metadata.name = this.parent.name + ' - ' + this.channel;
	}

	changePower(power) {
		return this.parent.changePowerChannel(this.channel, power);
	}

};
