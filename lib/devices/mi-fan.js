'use strict';

const { Fan, AdjustableFanSpeed } = require('abstract-things/climate');
const { boolean, number } = require('abstract-things/values');

const MiioApi = require('../device');

const Mode = require('./capabilities/mode');
const Power = require('./capabilities/power');
const AdjustableRollAngle = require('./capabilities/adjustable-roll-angle');
const AcceptedRollAngles = require('./capabilities/roll-angle-ranges');
const SwitchableLED = require('./capabilities/switchable-led');
const SwitchableRoll = require('./capabilities/switchable-roll');
const SwitchableChildLock = require('./capabilities/switchable-child-lock');

/**
 * For dmaker.fan.p5 (米家直流变频落地扇 1x)
 * Latest Firmware Version: 2.0.4.0008
*/

module.exports = class MiFan extends Fan
	.with(MiioApi, Power, Mode, SwitchableLED, SwitchableChildLock,
		AdjustableFanSpeed, AcceptedRollAngles, AdjustableRollAngle, SwitchableRoll) {

	static get type() {
		return 'miio:mifan1x';
	}

	constructor(options) {
		super(options);

		// the property name is predefined by the adopted capability
		// the value format is entirely up to you.
		this.defineProperty('power', {
			name: 'power',
			mapper: v => v ? 'on' : 'off'
		});

		this.defineProperty('speed', {
			name: 'fanSpeed',
			mapper: number
		});

		this.defineProperty('mode');
		this.updateModes([
			'normal',
			'nature'
		]);

		this.defineProperty('light', {
			name: 'led',
			mapper: v => v ? 'on' : 'off'
		});
		/**
		 *	'light': the property name in the physical device
		 *	  'led': the property name in the in-memory representation of the device
		 *	 mapper: maps the value from the physical device to the value for the in-memory representation
		**/

		this.defineProperty('roll_enable', {
			name: 'roll',
			mapper: v => v ? 'on' : 'off'
		});

		this.defineProperty('roll_angle', number);

		// the following 2 lines configurs the accepted roll angles.
		this.updateAcceptedRollAngles(30, 120, 30);
		this.addAcceptedRollAngles(140);

		this.defineProperty('child_lock', v => v ? 'on' : 'off');
	}

	/**
	 * For dmaker.fan.p5 (米家直流变频落地扇 1x)
	 * the manufacturer method is 's_power' with true/false as
	 * the accepted parameters
	 */
	changePower(power) {
		power = boolean(power);

		return this.call('s_power', [ power ], { refresh: ['power'] })
			.then(MiioApi.checkOk);
	}
	// in 'refresh' need to use the property name from the in-memory
	// representation, this would be reverseMapped to the property name
	// in the physical device

	changeSpeed(targetSpeed) {
		return this.call('s_speed', [ parseInt(targetSpeed) ], { refresh: [ 'speed' ] })
			.then(MiioApi.checkOk);
	}

	changeMode(targetMode) {
		return this.call('s_mode', [ targetMode ], { refresh: [ 'mode' ] })
			.then(MiioApi.checkOk);
	}

	/**
	 * Normally, this would not be reuired, but the method name
	 * for dmaker.fan.p5 (米家直流变频落地扇 1x) is different than
	 * the one defined in SwitchableLED capability. It uses 's_light'
	 *
	 * @param {*} targetState: expects a string 'on' or 'off'
	 * @returns
	 */
	changeLED(targetState) {
		targetState = boolean(targetState);

		return this.call('s_light', [ targetState ], { refresh: [ 'led' ] })
			.then(MiioApi.checkOk);
	}

	changeRollAngle(targetAngle) {
		targetAngle = number(targetAngle);

		if(targetAngle === 0) {
			return this.changeRoll('off');
		}
		console.log(this);

		this.acceptedRollAngles().then(acceptedRollAngles => {
			console.log('-----------------------');
			console.log(this);
			if(acceptedRollAngles.includes(targetAngle)) {
				return this.call('s_angle', [ targetAngle ], { refresh: [ 'roll_angle' ] })
					.then(MiioApi.checkOk);
			}
		});
	}

	changeChildLock(lock) {
		lock = boolean(lock);

		return this.call('s_lock', [ lock ], { refresh: [ 'child_lock' ] })
			.then(MiioApi.checkOk);
	}
};
