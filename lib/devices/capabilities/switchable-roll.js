'use strict';

const { Thing, State} = require('abstract-things');
const { boolean } = require('abstract-things/values');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
		static get capability() {
			return 'miio:switchable-roll';
		}

		static availableAPI(builder) {
			builder.action('roll')
				.description('Get or set whether the fan should roll')
				.argument('boolean', true, 'If provided, set Roll state to this value')
				.returns('boolean', 'If Roll is enabled')
				.done();
		}

		propertyUpdated(key, value) {
			if(key === 'roll') {
				this.updateState('roll', value);
			}

			super.propertyUpdated(key, value);
		}

		roll(targetState) {
			if(typeof targetState === 'undefined') {
				return this.getState('roll');
			}

			targetState = boolean(targetState);
			return this.changeRoll(targetState)
				.then(() => this.getState('roll'));
		}

		changeRoll(targetState) {
			return this.call('s_roll', [ targetState ], { refresh: [ 'roll' ] })
				.then(() => null);
		}
	});
