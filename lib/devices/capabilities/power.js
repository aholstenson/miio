'use strict';

const { Thing, SwitchablePower } = require('abstract-things');

module.exports = Thing.mixin(Parent => class extends Parent.with(SwitchablePower) {
	propertyUpdated(key, value) {
		if(key === 'power') {
			this.updatePower(value);
		}

		super.propertyUpdated(key, value);
	}
});

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
