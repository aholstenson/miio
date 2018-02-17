'use strict';

const { Thing } = require('abstract-things');
const { Colorable } = require('abstract-things/lights');

module.exports = Thing.mixin(Parent => class extends Parent.with(Colorable) {
	propertyUpdated(key, value) {
		if(key === 'color') {
			this.updateColor(value);
		}

		super.propertyUpdated(key, value);
	}
});
