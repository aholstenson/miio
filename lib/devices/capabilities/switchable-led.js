'use strict';

const { Thing, State } = require('abstract-things');
const { boolean } = require('abstract-things/values');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
	static get capability() {
		return 'miio:switchable-led';
	}

	static availableAPI(builder) {
		builder.action('led')
			.description('Get or set if the LED should be used')
			.argument('boolean', true, 'If provided, set the LED power to this value')
			.returns('boolean', 'If the LED is on')
			.done();
	}

	propertyUpdated(key, value) {
		if(key === 'led') {
			this.updateState('led', value);
		}

		super.propertyUpdated(key, value);
	}

	/**
	 * Get or set if the LED should be on.
	 *
	 * @param {boolean} power Optional power to set LED to
	 */
	led(power) {
		if(typeof power === 'undefined') {
			return this.getState('led');
		}

		power = boolean(power);
		return this.changeLED(power)
			.then(() => this.getState('led'));
	}

	/**
	 * Set if the LED should be on when the device is running.
	 */
	changeLED(power) {
		return this.call('set_led', [ power ? 'on' : 'off' ], { refresh: [ 'led' ] })
			.then(() => null);
	}
});
