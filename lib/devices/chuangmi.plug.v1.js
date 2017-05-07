'use strict';

const Device = require('../device');

const PowerChannels = require('./capabilities/power-channels');

class PlugV1 extends Device {
	static get TYPE() { return 'power-plug' }

	constructor(options) {
		super(options);

		this.type = PlugV1.TYPE;

		this.defineProperty('on', {
			name: 'powerChannelMain'
		});
		this.defineProperty('usb_on', {
			name: 'powerChannelUsb'
		});
		PowerChannels.extend(this, {
			channels: [ 'main', 'usb' ],
			set: (channel, power) => {
				switch(channel) {
					case 'main':
						return this.call(power ? 'set_on' : 'set_off', [], { refresh: true });
					case 'usb':
						return this.call(power ? 'set_usb_on' : 'set_usb_off', [], { refresh: true });
				}
			}
		});

	}
}

module.exports = PlugV1;
