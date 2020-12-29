'use strict';

const { Thing, Nameable } = require('abstract-things');
const Fan = require('abstract-things/climate/fan');
const AdjustableFanSpeed = require('abstract-things/climate/adjustable-fan-speed');

const MiioApi = require('../device');

const Power = require('./capabilities/power');
const Buzzer = require('./capabilities/buzzer');
const Mode = require('./capabilities/mode');
const SwitchableLED = require('./capabilities/switchable-led');

// const IDENTITY_MAPPER = v => v;

module.exports = Thing.mixin(Parent => class MiFan extends Parent
	.with(Fan, AdjustableFanSpeed, MiioApi, Power, Buzzer, Nameable, Mode, SwitchableLED)
{
	static get type() {
		return 'miio:mifan';
	}

	constructor(options) {
		super(options);

		// State for Power Capability
		this.defineProperty('power', v => v === 'on');

		// State for Buzzer Capability
		// Normally, only need to define property for buzzer
		// But `changeBuzzer` method for mifan is `s_sound` instead of `set_buzzer`
		// whether the device should beep
		this.defineProperty('buzzer', v => v === 'on');

		// State for SwitchableLED capability
		// only need to define property for buzzer
		// whether the device LED indicator should be turned on
		this.defineProperty('led', v => v === 'on');

		// TODO: Define Capability for Scheduled Power Off
		this.defineProperty('delayOff', {
			name: 'offDelay',
			mapper: parseInt
		});

		// State for Mode capability
		// wind_mode
		this.defineProperty('mode');
		this.updateModes([
			'normal',
			'nature'
		]);

		this.defineProperty('fanSpeed', {
			name: 'fanSpeed',
			mapper: parseInt
		});

		this.defineProperty('name');
	}

	/* Required by SwitchablePower, which Power was based on */
	changePower(power) {
		return this.call('s_power', power, { refresh: ['power'] })
			.then(MiioApi.checkOk);
	}

	/* Required by SwitchableMode, which Mode was based on */
	/**
	 * Perform a mode change as requested by `mode(string)` or
	 * `setMode(string)`.
	 */

	//  Questions:
	//  1. when refresh the property, does the `key` need to match the one
	// 		 used by xiaomi?
	//  2. when reading the property, does the `key` need to match the one
	// 		 used by xiaomi?
	//  3. If the answer is no to both questions, then can we name the `key`
	//     however we like?
	//  4. Do we need to check the current mode on device? If it is the same,
	//     we just ignore the interaction?

	changeMode(mode) {
		return this.call('get_prop', '[["all"]]')
			.then(result => {
				if(mode !== result[1] ) {
					return this.call('s_mode', mode, { refresh: ['mode'] })
						.then(MiioApi.checkOk);
				}
			});
	}

	// Customize Buzzer capability
	changeBuzzer(active) {
		return this.call('s_sound', active, { refresh: [ 'buzzer' ]})
			.then(MiioApi.checkOk);
	}
});
