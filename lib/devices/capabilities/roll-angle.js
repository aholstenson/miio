'use strict';

const { Thing, State } = require('abstract-things');
const { number } = require('abstract-things/values')

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
	static get capability()  {
		return 'miio:roll-angle';
	}

	static availableAPI(builder) {
		builder.action('rollAngle')
			.description('Get the roll angle')
			.returns('number', 'current roll angle')
			.done();

		builder.event('rollAngleChanged')
			.type('number')
			.description('The roll angle has changed')
			.done();
	}

	rollAngle() {
		return Promise.resolve(this.getState('roll_angle'));
	}

	updateRollAngle(rollAngle) {
		rollAngle = number(rollAngle);

		if(this.updateState('roll_angle', rollAngle)) {
			this.emitEvent('rollAngleChanged', rollAngle);
		}
	}
});
