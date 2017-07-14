'use strict';

const Device = require('../device');

const Power = require('./capabilities/power');

class EyecareLamp2 extends Device {
	static get TYPE() {
		return 'light'
	}

	constructor(options) {
		super(options);

		this.type = EyecareLamp2.TYPE;

		this.defineProperty('power', {
			name: 'power',
			mapper: v => v === 'on'
		});
		Power.extend(this, {
			set: power => this.call('set_power', [power ? 'on' : 'off'], {
				refresh: true
			})

		});

		this.defineProperty('bright', {
			name: 'brightness',
			mapper: parseInt
		});
		this.capabilities.push('brightness');

		this.defineProperty('notifystatus', {
			name: 'notifyStatus',
			mapper: v => v === 'on'
		});

		this.defineProperty('ambstatus', {
			name: 'ambientStatus',
			mapper: v => v === 'on'
		});

		this.defineProperty('ambvalue', {
			name: 'ambientValue',
			mapper: parseInt
		});

		this.defineProperty('eyecare', {
			name: 'eyeCare',
			mapper: v => v === 'on'
		});

		this.defineProperty('scene_num', {
			name: 'eyeCareMode',
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

		this.defineProperty('bls', {
			name: 'bls',
			mapper: v => v === 'on'
		});

		this.defineProperty('dvalue', {
			name: 'dvalue',
			mapper: parseInt
		});
	}

	/**
	 * Get the current brightness of the light as a percentage between 1 and
	 * 100.
	 */
	get brightness() {
		return this.property('brightness');
	}

	/**
	 * Set the brightness of the device as a percentage between 1 and 100.
	 */
	setBrightness(brightness, options = {}) {
		return this.call('set_bright', [brightness, options], {
			refresh: true
		}).then(Device.checkOk);
	}


	/**
	 * Is eyeCare active?
	 */
	get eyeCare() {
		return this.property('eyeCare');
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
	 * Get the current eyeCare mode
	 */
	get eyeCareMode() {
		return this.property('eyeCareMode');
	}

	/**
	 * Set the current eyeCare mode
	 */
	setEyeCareMode(mode) {

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
			})
			.then(() => null);
	}
}

module.exports = EyecareLamp2;
