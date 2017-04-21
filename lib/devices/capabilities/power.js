'use strict';


/**
 * Setup power support for the given device.
 */
function mixin(device, options) {
	device.capabilities.push('power');

	Object.defineProperty(device, 'power', {
		get: function() {
			return this.property('power');
		}
	});

	device.setPower = function(power) {
		return options.set.apply(options, arguments)
			.then(() => power);
	};
}

module.exports.extend = mixin;
