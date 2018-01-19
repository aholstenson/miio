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

