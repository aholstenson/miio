'use strict';

const SubDevice = require('./subdevice');
const { Controller, Actions } = require('abstract-things/controllers');

/**
 * Cube device, emits `action` with an object when someone interacts with
 * the cube.
 *
 * Supports the actions:
 * * `alert` - when the cube has been idle for a while and it wakes up
 * * `flip90` - when the cube is flipped 90 degrees in any direction
 * * `flip180` - when the cube is flipped 180 degress in any direction
 * * `move` - when the cube is moved on its current surface (slide)
 * * `shake_air` - when the cube is shaken in the air
 * * `free_fall` - when the cube is dropped in a free fall
 * * `swing` - when the cube is held in hand and the fake thrown
 */
module.exports = class Cube extends SubDevice.with(Controller, Actions) {
	constructor(parent, info) {
		super(parent, info);

		this.miioModel = 'lumi.cube';

		this.updateActions([
			'alert',
			'flip90',
			'flip180',
			'move',
			'tap_twice',
			'shake_air',
			'free_fall',
			'rotate'
		]);
	}

	_report(data) {
		super._report(data);

		if(typeof data.status !== 'undefined') {
			this.debug('Action performed:', data.status);
			this.emitAction(data.status);
		}

		if(typeof data.rotate !== 'undefined') {
			const r = data.rotate;
			const idx = r.indexOf(',');
			const amount = parseInt(r.substring(0, idx));
			this.debug('Action performed:', 'rotate', amount);
			this.emitAction('rotate', {
				amount: amount
			});
		}
	}
};
