'use strict';

const { Thing, BatteryLevel } = require('abstract-things');

module.exports = Thing.mixin(Parent => class extends Parent.with(BatteryLevel) {
	propertyUpdated(key, value) {
		if(key === 'batteryLevel') {
			this.updateBatteryLevel(value);
		}

		super.propertyUpdated(key, value);
	}
});

