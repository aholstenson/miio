'use strict';

const Device = require('../device');

const PowerChannels = require('./capabilities/power-channels');

class PlugV1 extends Device {
	static get TYPE() { return 'power-plug' }

	constructor(options) {
		super(options);

		this.type = PlugV1.TYPE;

		this.defineProperty('on', {
			name: 'powerChannelMain',
			mapper: v => v === 'on'
		});
		this.defineProperty('usb_on', {
			name: 'powerChannelUsb',
			mapper: v => v === 'on'
		});
		PowerChannels.extend(this, {
			channels: [ 'main', 'usb' ],
			set: (channel, power) => {
				switch(channel) {
					case 'main':
						return this.call(power ? 'set_on' : 'set_off', [], { refresh: true })
							.then(Device.checkOk);
					case 'usb':
						return this.call(power ? 'set_usb_on' : 'set_usb_off', [], { refresh: true })
							.then(Device.checkOk);
				}
			}
		});

	}
}

module.exports = PlugV1;
