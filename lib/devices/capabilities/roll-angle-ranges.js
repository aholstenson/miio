'use strict';
const isDeepEqual = require('deep-equal');

const { Thing } = require('abstract-things');
const { number } = require('abstract-things/values');

const AcceptedRollAngles = Symbol('acceptedRollAngles');

module.exports = Thing.mixin(Parent => class extends Parent {

	static availableAPI(builder) {
        builder.action('acceptedRollAngles')
            .description('Get the accepted roll angle ranges this device supports')
            .returns('object')
            .done();

        builder.event('acceptedRollAnglesChanged')
            .type('object')
            .description('the accepted roll angle values have changed')
            .done();
    }

    acceptedRollAngles() {
        const acceptedRollAngles = this[AcceptedRollAngles];

        if(! acceptedRollAngles) {
            return Promise.reject(new Error('Roll angle ranges have not been set'))
        }

        return Promise.resolve(acceptedRollAngles);
    }

    updateAcceptedRollAngles(min, max, stepper) {
        min = number(min);
        max = number(max);

        if(min === max) { return [ min ];}

        if(stepper === 0) {
            throw new Error('invalid stepper "0" while upper limit not equal to lower limit');
        }

        if(min > max) {
            const temp = max;
            max = min;
            min = temp;
        }

        const acceptedRollAngles = this.range2Array(min, max, stepper);
        if(! isDeepEqual(this[AcceptedRollAngles], acceptedRollAngles)) {
			this[AcceptedRollAngles] = acceptedRollAngles;
			this.emitEvent('acceptedRollAnglesChanged', acceptedRollAngles);
		}
    }

    range2Array(min, max, stepper=1) {
        let acceptedValues = [];
        for(var i = min; i <= max; i += stepper) {
            acceptedValues.push(i);
        }
        return acceptedValues;
	}

	addAcceptedRollAngles(...angles) {
		const acceptedRollAngles = this[AcceptedRollAngles];

		angles.map(angle => {
			angle = number(angle);

			if(! this[AcceptedRollAngles].includes(angle)) {
				this[AcceptedRollAngles].push(angle);
			}
		});

		if(! isDeepEqual(this[AcceptedRollAngles], acceptedRollAngles)) {
			this.emitEvent('acceptedRollAnglesChanged', this[AcceptedRollAngles] );
		}
	}

	isAcceptedAngle(angle) {
		var allowedAngles = [];

		return this.acceptedRollAngles().then(res => res.includes(angle) );
	}
});
