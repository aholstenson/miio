'use strict';

const { Thing, SwitchablePower } = require('abstract-things');
const { PowerPlug, PowerOutlet } = require('abstract-things/electrical');

const MiioApi = require('../device');
const MiioPower = require('./capabilities/power');

module.exports = class extends Thing.with(PowerPlug, PowerOutlet, MiioApi, MiioPower) {
	static get type() {
		return 'miio:power-plug';
	}

	constructor(options) {
		super(options);

		this.defineProperty('on', {
			name: 'power'
		});

		this.addChild(new USBOutlet(this));
	}

	setName(name) {
		return super.setName(name)
			.then(n => {
				this.child('usb').updateName();
				return n;
			});
	}

	propertyUpdated(key, value) {
		switch(key) {
			case 'powerChannelUsb':
				this.child('usb').updatePower(value);
				break;
		}
	}
};

class USBOutlet extends PowerOutlet.with(SwitchablePower) {

	constructor(parent) {
		super();

		this.id = parent.id + ':usb';

		this.parent = parent;

		this.updateName();
	}

	updateName() {
		this.metadata.name = this.parent.name + ' - USB';
	}

	changePower(power) {
		return this.parent.call(power ? 'set_usb_on' : 'set_usb_off', [], { refresh: true });
	}

}
