'use strict';


/**
 * Setup sensor support for a device.
 */
function mixin(device, options) {
	if(device.capabilities.indexOf('sensor') < 0) {
		device.capabilities.push('sensor');
	}

	device.capabilities.push(options.name);
	Object.defineProperty(device, options.name, {
		get: function() {
			return this.property(options.name);
		}
	});
}

module.exports.extend = mixin;
