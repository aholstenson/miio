'use strict';

const { Thing, BatteryLevel } = require('abstract-things');

module.exports = Thing.mixin(Parent => class extends Parent.with(BatteryLevel) {

	constructor(...args) {
		super(...args);

		this.defineProperty('voltage');
	}

	propertyUpdated(key, value, oldValue) {
		if(key === 'voltage') {
			this.updateBatteryLevel((value - 2800) / 5);
		}

		super.propertyUpdated(key, value, oldValue);
	}

});
