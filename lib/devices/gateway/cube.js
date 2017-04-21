'use strict';


const SubDevice = require('./subdevice');

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
class Cube extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'controller';
		this.model = 'lumi.cube';

		this.defineProperty('voltage');
	}

	_report(info) {
		super._report(info);

		if(typeof info.data.status !== 'undefined') {
			this.debug('Action performed:', info.data.status);
			this.emit('action', {
				id: info.data.status
			});

			delete info.data.status;
		}

		if(typeof info.data.rotate !== 'undefined') {
			const r = info.data.rotate;
			const idx = r.indexOf(',');
			const amount = parseInt(r.substring(0, idx));
			this.debug('Action performed:', 'rotate', amount);
			this.emit('action', {
				id: 'rotate',
				amount: amount
			});
			delete info.data.rotate;
		}
	}

	get actions() {
		return [
			'alert',
			'flip90',
			'flip180',
			'move',
			'tap_twice',
			'shake_air',
			'free_fall',
			'rotate'
		];
	}
}

module.exports = Cube;
