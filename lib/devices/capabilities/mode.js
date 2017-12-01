'use strict';

const { Thing, SwitchableMode } = require('abstract-things');

module.exports = Thing.mixin(Parent => class extends Parent.with(SwitchableMode) {
	propertyUpdated(key, value) {
		if(key === 'mode') {
			this.updateMode(value);
		}

		super.propertyUpdated(key, value);
	}
});
