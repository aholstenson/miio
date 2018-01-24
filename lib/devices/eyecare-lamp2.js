'use strict';

const MiioApi = require('../device');

const { Children } = require('abstract-things');
const { Light, Dimmable, SwitchablePower } = require('abstract-things/lights');
const { percentage } = require('abstract-things/values');

const MiioDimmable = require('./capabilities/dimmable');
const MiioPower = require('./capabilities/power');

module.exports = class EyecareLamp2 extends Light
	.with(MiioPower, MiioDimmable, Children, MiioApi)
{

	constructor(options) {
		super(options);

		this.defineProperty('power', {
			name: 'power',
			mapper: v => v === 'on'
		});

		this.defineProperty('bright', {
			name: 'brightness',
			mapper: parseInt
		});

		// Get if the
		this.defineProperty('notifystatus', {
			name: 'notifyStatus',
			mapper: v => v === 'on'
		});

		// Power of the secondary light
		this.defineProperty('ambstatus', {
			name: 'ambientPower',
			mapper: v => v === 'on'
		});

		// Brightness of the secondary light
		this.defineProperty('ambvalue', {
			name: 'ambientBrightness',
			mapper: parseInt
		});

		// If the main light is on
		this.defineProperty('eyecare', {
			name: 'eyeCare',
			mapper: v => v === 'on'
		});

		// The current user-defined scene
		this.defineProperty('scene_num', {
			name: 'userScene',
			mapper: v => {
				switch (v) {
					case 1:
						return 'study';
					case 2:
						return 'reading';
					case 3:
						return 'phone';
				}
			}
		});

		this.setModes([ 'study', 'reading', 'phone' ]);

		this.defineProperty('bls', {
			name: 'bls',
			mapper: v => v === 'on'
		});

		this.defineProperty('dvalue', {
			name: 'dvalue',
			mapper: parseInt
		});

		this.ambient = new AmbientLight(this);
		this.addChild(this.ambient);
	}

	changePower(power) {
		return this.call('set_power', [power ? 'on' : 'off'], {
			refresh: true
		});
	}

	changeBrightness(brightness) {
		return this.call('set_bright', [ brightness ], {
			refresh: true
		}).then(MiioApi.checkOk);
	}

	/**
	 * Is eyeCare active?
	 */
	eyeCare() {
		return Promise.resolve(this.property('eyeCare'));
	}

	/**
	 * Enable the eyeCare
	 */
	setEyeCare(enable) {
		return this.call('set_eyecare', [enable ? 'on' : 'off'], {
				refresh: true
			})
			.then(() => null);
	}

	/**
	 * Set the current eyeCare mode
	 *
	changeMode(mode) {

		switch (mode) {
			case 'study':
				mode = 1;
				break;
			case 'reading':
				mode = 2;
				break;
			case 'phone':
				mode = 3;
				break;
			default:
				return Promise.reject(new Error('Invalid EyeCare Mode: ' + mode));
		}
		return this.call('set_user_scene', [mode], {
			refresh: true
		});
	}
	*/

	setAmbientPower(power) {
		return this.call.send('enable_amb', [ power ? 'on' : 'off' ])
			.then(MiioApi.checkOk);
	}

	setAmbientBrightness(brightness) {
		brightness = percentage(brightness, { min: 0, max: 100 });

		return this.call.send('set_amb_bright', [ brightness ])
			.then(MiioApi.checkOk);
	}

	propertyUpdated(key, value) {
		super.propertyUpdated(key, value);

		switch(key) {
			case 'ambientPower':
				this.ambient.updatePower(value);
				break;
			case 'ambientBrightness':
				this.ambient.updateBrightness(value);
				break;
		}
	}
};

class AmbientLight extends Light.with(Dimmable, SwitchablePower) {

	constructor(parent) {
		super();

		this.parent = parent;
		this.id = parent.id + ':ambient';
	}

	changePower(power) {
		return this.parent.setAmbientPower(power);
	}

	changeBrightness(brightness) {
		return this.parent.setAmbientBrightness(brightness);
	}
}
