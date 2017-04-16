
/**
 * Setup power support for the given device.
 */
function mixin(device, options) {
	device.capabilities.push('power-channels');

	Object.defineProperty(device, 'powerChannels', {
		value: options.channels
	});

	device.power = function(channel) {
		if(typeof channel === 'undefined') {
			return this.property('power');
		}
		return this.property('powerChannel' + channel);
	};

	device.setPower = function(channel, power) {
		if(typeof power === 'undefined') {
			power = channel;
			channel = 0;
		}

		return options.set(channel, power)
			.then(() => power);
	};

	device.on('propertyChanged', function(event) {
		const match = event.property.match(/^powerChannel([0-9]+)$/);
		if(! match) return;

		let result = [];
		for(let i=0; i<this.powerChannels; i++) {
			result[i] = this.power(i);
		}
		this.setProperty('power', result);
	});
}


module.exports.extend = mixin;
