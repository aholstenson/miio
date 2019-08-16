'use strict';

const { Thing } = require('abstract-things');
const { number } = require('abstract-things/values');

const RollAngle = require('./roll-angle');

module.exports = Thing.mixin(Parent => class extends Parent.with(RollAngle) {
	static get capability() {
		return 'miio:adjustable-roll-angle';
	}

	static availableAPI(builder) {
		builder.action('rollAngle')
			.description('Get or set the roll angle')
			.argument('number', true, 'Optional roll angle to set')
			.returns('number', 'the roll angle')
			.done();
	}

	propertyUpdated(key, value) {
		if(key === 'roll_angle') {
			this.updateState('roll_angle', value);
		}

		super.propertyUpdated(key, value);
	}

	rollAngle(targetAngle) {
		if(typeof targetAngle === 'undefined') {
			return super.rollAngle();
		}

		return this.setRollAngle(targetAngle);
	}

	setRollAngle(targetAngle) {
		targetAngle = number(targetAngle);

		return this.isAcceptedAngle(targetAngle).then(isAccepted => {
			if(isAccepted) {
				try {
					return Promise.resolve(this.changeRollAngle(targetAngle))
						.then(() => super.rollAngle());
				} catch(ex) {
					return Promise.reject(ex);
				}
			}

			return Promise.reject(new Error(`Unacceptable angle: ${targetAngle}`));
		});

	}

	changeRollAngle(targetAngle) {
		throw new Error('changeRollAngle not implemented');
	}
});
