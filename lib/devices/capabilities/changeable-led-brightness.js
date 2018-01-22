'use strict';

const { Thing, State } = require('abstract-things');
const { string } = require('abstract-things/values');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
	static get capability() {
		return 'miio:led-brightness';
	}

	static availableAPI(builder) {
		builder.action('ledBrightness')
			.description('Get or set the LED brightness')
			.argument('string', true, 'If provided, set the LED brightness to this value')
			.returns('string', 'The LED brightness')
			.done();
	}

	propertyUpdated(key, value) {
		if(key === 'ledBrightness') {
			this.updateState('ledBrightness', value);
		}

		super.propertyUpdated(key, value);
	}

	/**
	 * Get or set if the LED brightness.
	 *
	 * @param {string} brightness The LED brightness
	 */
	ledBrightness(brightness) {
		if(typeof brightness === 'undefined') {
			return this.getState('ledBrightness');
		}

		brightness = string(brightness);
		return this.changeLEDBrightness(brightness)
			.then(() => this.getState('ledBrightness'));
	}

	/**
	 * Set the LED brightness.
	 */
	changeLEDBrightness(brightness) {
		throw new Error('changeLEDBrightness not implemented');
	}
});
