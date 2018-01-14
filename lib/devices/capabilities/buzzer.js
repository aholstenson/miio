'use strict';

const { Thing, State } = require('abstract-things');
const { boolean } = require('abstract-things/values');

const MiioApi = require('../../device');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
	static get capability() {
		return 'miio:buzzer';
	}

	static availableAPI(builder) {
		builder.event('buzzerChanged')
			.type('boolean')
			.description('Buzzer state has changed')
			.done();

		builder.action('buzzer')
			.description('Get or set if the buzzer is active')
			.argument('boolean', true, 'If the device should beep')
			.returns('boolean', 'If the buzzer is on')
			.done();

		builder.action('setBuzzer')
			.description('Set if the buzzer is active')
			.argument('boolean', false, 'If the device should beep')
			.returns('boolean', 'If the buzzer is on')
			.done();

		builder.action('getBuzzer')
			.description('Get if the buzzer is active')
			.returns('boolean', 'If the buzzer is on')
			.done();
	}

	propertyUpdated(key, value) {
		if(key === 'buzzer') {
			if(this.updateState('buzzer', value)) {
				this.emitEvent('buzzerChanged', value);
			}
		}

		super.propertyUpdated(key, value);
	}

	/**
	 * Get or set if the buzzer is active.
	 *
	 * @param {boolean} active
	 *   Optional boolean to switch buzzer to.
	 */
	buzzer(active) {
		if(typeof active === 'undefined') {
			return this.getBuzzer();
		}

		return this.setBuzzer(active);
	}

	getBuzzer() {
		return this.getState('buzzer');
	}

	setBuzzer(active) {
		active = boolean(active);

		return this.changeBuzzer(active)
			.then(() => this.getBuzzer());
	}

	changeBuzzer(active) {
		return this.call('set_buzzer', [ active ? 'on' : 'off' ], {
			refresh: [ 'buzzer' ]
		})
			.then(MiioApi.checkOk);
	}
});
