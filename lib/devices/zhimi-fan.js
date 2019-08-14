'use strict';

const { Fan, AdjustableFanSpeed } = require('abstract-things/climate');
const { boolean, number } = require('abstract-things/values');

const MiioApi = require('../device');

const AcceptedRollAngles = require('./capabilities/roll-angle-ranges');
const AdjustableRollAngle = require('./capabilities/adjustable-roll-angle');
const Buzzer = require('./capabilities/buzzer');
const ChangeableLEDBrightness = require('./capabilities/changeable-led-brightness');
const Mode = require('./capabilities/mode');
const Power = require('./capabilities/power');
const SwitchableRoll = require('./capabilities/switchable-roll');
const SwitchableChildLock = require('./capabilities/switchable-child-lock');

const BuzzerOn = 2;
const BuzzerOff = 0;

const Identity_Mapper = v => v;

module.exports = class extends Fan
	.with(MiioApi, Power, Mode, Buzzer, ChangeableLEDBrightness, SwitchableChildLock,
		AdjustableFanSpeed, AcceptedRollAngles, AdjustableRollAngle, SwitchableRoll) {
	static get type() {
		return 'miio:zhimifan';
	}

	constructor(options) {
		super(options);

		this.defineProperty('power', {
			name: 'power',
			mapper: Identity_Mapper
		});


		// "natural_level",
		// "poweroff_time",

		this.defineProperty('buzzer', {
			name: 'buzzer',
			mapper: v => {
				switch(number(v)) {
					case BuzzerOff:
						return 'off';
					case BuzzerOn:
						return 'on';
					default:
						throw new Error('invalid response from getting buzzer state');
				}
			}
		});

		this.defineProperty('speed_level', {
			name: 'fanSpeed',
			mapper: v => number(v)
		});

		this.defineProperty('led_b', {
			name: 'ledBrightness',
			mapper: v => {
				switch(parseInt(v)) {
					case 0:
						return 'bright';
					case 1:
						return 'dim';
					case 2:
						return 'off';
					default:
						return 'unknown';
				}
			}
		});

		this.defineProperty('angle_enable', {
			name: 'roll',
			mapper: Identity_Mapper
		});

		this.defineProperty('angle', {
			name: 'roll_angle',
			mapper: number
		});

		this.updateAcceptedRollAngles(30, 120, 30);

		this.defineProperty('child_lock', Identity_Mapper);
	}

	changePower(power) {
		power = boolean(power);

		return this.call('set_power', [ power ], {
			refresh: [ 'power' ]
		}).then(MiioApi.checkOk);
	}

	// Due to difference in parameter values of zhimi.fan.sa1, we need to override changeBuzzer(buzzer),
	// although it is already implemented by Buzzer capability
	changeBuzzer(buzzer) {
		return this.call('set_buzzer', [ buzzer ? BuzzerOn : BuzzerOff], {
			refresh: [ 'buzzer' ]
		}).then(MiioApi.checkOk);
	}

	changeRoll(targetState) {
		return this.call('set_angle_enable', [ targetState ? 'on' : 'off' ], { refresh: [ 'roll' ] })
			.then(MiioApi.checkOk);
	}

	changeRollAngle(angle) {
		return this.call('set_angle', [ angle ], { refresh: [ 'roll_angle']})
			.then(MiioApi.checkOk);
	}

	changeFanSpeed(speed) {
		return this.call('set_speed_level', [ speed ], { refresh: [ 'fanSpeed' ] })
			.then(MiioApi.checkOk);
	}

	// Due to difference in method name and parameter values of zhimi.fan.sa1, we need to override changeLED(led),
	// although it is already implemented by Buzzer capability
	// physical device method: set_led_b
	// parameter: 0 (Bright) / 1 (Dim) / 2 (Off)
	changeLEDBrightness(brightness) {
		switch (brightness) {
			case 'bright':
			case '0':
				brightness = 0;
				break;
			case 'dim':
			case '1':
				brightness = 1;
				break;
			case 'off':
			case '2':
				brightness = 2;
				break;
			default:
				return Promise.reject(new Error(`Invalid brightness option: ${brightness}`));
		}

		return this.call('set_led_b', [ brightness ], {
			refresh: [ 'ledBrightness' ]
		}).then(MiioApi.checkOk);
	}

	changeChildLock(lock) {
		return this.call('set_child_lock', [ lock ? 'on' : 'off' ], {
			refresh: [ 'child_lock' ]
		}).then(MiioApi.checkOk);
	}
};
