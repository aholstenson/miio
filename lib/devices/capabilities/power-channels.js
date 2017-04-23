'use strict';

function toPropertyName(id) {
	return id[0].toUpperCase() + id.substring(1);
}

/**
 * Setup power support for the given device.
 *
 * This mixing requires that the device declares several properties prefixed
 * with powerChannel. These properties are used to read if there is power
 * on a certain channel.
 *
 */
function mixin(device, options) {
	device.capabilities.push('power-channels');

	const channels = options.channels.map(v => String(v));

	Object.defineProperty(device, 'powerChannels', {
		value: channels
	});

	device.power = function(channel) {
		if(typeof channel === 'undefined') {
			return this.property('power');
		}
		return this.property('powerChannel' + toPropertyName(channel));
	};

	device.setPower = function(channel, power) {
		if(typeof power === 'undefined') {
			// No power specified, assume that t
			if(typeof channel !== 'boolean') {
				throw new Error('setPower needs either power as a boolean or channel + power');
			}

			let promise = Promise.resolve();
			let actualPower = channel;
			channels.forEach(c => {
				promise = promise.then(() => options.set(c, actualPower));
			});
			return promise.then(() => this.power());
		}

		return options.set(String(channel), power)
			.then(() => power);
	};

	device.on('propertyChanged', function(event) {
		const match = event.property.match(/^powerChannel(.+)$/);
		if(! match) return;

		let result = {};
		const channels = this.powerChannels;
		for(let i=0; i<channels.length; i++) {
			result[channels[i]] = this.power(channels[i]);
		}
		this.setProperty('power', result);
	});
}


module.exports.extend = mixin;
