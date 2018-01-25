'use strict';

const { Thing, BatteryLevel } = require('abstract-things');

const VOLTAGE_MIN = 2800;
const VOLTAGE_MAX = 3300;

/**
 * Mixin for subdevices that support reporting voltage and that can be
 * transformed into a battery level.
 */
module.exports = Thing.mixin(Parent => class extends Parent.with(BatteryLevel) {

	constructor(...args) {
		super(...args);

		this.defineProperty('voltage');
	}

	propertyUpdated(key, value, oldValue) {
		if(key === 'voltage') {
			this.updateBatteryLevel((value - VOLTAGE_MIN) / (VOLTAGE_MAX - VOLTAGE_MIN) * 100);
		}

		super.propertyUpdated(key, value, oldValue);
	}

});
