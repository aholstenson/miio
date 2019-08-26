'use strict';

const { Thing, State } = require('abstract-things');
const { boolean } = require('abstract-things/values');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
	static get capability() {
		return 'miio:switchable-child-lock';
	}

	static availableAPI(builder) {
		builder.action('childLock')
			.description('Get or set if the childLock should be used')
			.argument('boolean', true, 'If provided, set the childLock mode to this value')
			.returns('boolean', 'If the childLock is on')
			.done();
	}

	propertyUpdated(key, value) {
		if(key === 'child_lock') {
			this.updateState('child_lock', value);
		}

		super.propertyUpdated(key, value);
	}

	/**
	 * Get or set if the ChildLock should be on.
	 *
	 * @param {boolean} lock Optional lock to set ChildLock to
	 */
	childLock(lock) {
		if(typeof lock === 'undefined') {
			return this.getState('child_lock');
		}

		lock = boolean(lock);
		return this.changeChildLock(lock)
			.then(() => this.getState('child_lock'));
	}

	/**
	 * Set if the ChildLock should be on when the device is running.
	 */
	changeChildLock(lock) {
		throw new Error('changeChildLock has not been implemented');
	}
});
