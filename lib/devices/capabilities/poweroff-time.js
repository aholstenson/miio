'use strict';

const { Thing, State } = require('abstract-things');
const { number } = require('abstract-things/values')

const MiioApi = require('../../device');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
	static get capability()  {
		return 'miio:poweroff-time';
	}

	static availableAPI(builder) {
		builder.action('poweroffTime')
			.description('Get the poweroff time')
			.argument('number', true, 'If provided, set PoweroffTime state to this value')
			.returns('number', 'current poweroff time')
			.done();

		builder.event('poweroffTimeChanged')
			.type('number')
			.description('The poweroff time has changed')
			.done();
	}

	/*
		When setting poweroff time, we need to record the time when the value is changed.
		Because we need this time to calculate time to poweroff when reading 'poweroff_time'

		time_till_poweroff = poweroff_changed_at + poweroff_time - time_now
	*/
	poweroffTime(time) {
		if(typeof time === 'undefined') {
			return this.getPoweroffTime();
		}

		return this.setPoweroffTime(time);
	}

	getPoweroffTime() {
		return this.getState('poweroff_time');
	}

	setPoweroffTime(time) {
		time = number(time);
		return this.changePoweroffTime(time)
			.then(() => this.getPoweroffTime());
	}

	changePoweroffTime(time) {
		return this.call('set_poweroff_time', [ time ], {
			refresh: 'poweroff_time'
		}).then(MiioApi.checkOk);
	}

	propertyUpdated(key, value) {
		if(key === 'poweroff_time') {
			if(this.updateState('poweroff_time', value)) {
				this.emitEvent('poweroffTimeChanged', value);
			}
		}

		super.propertyUpdated(key, value);
	}
});
