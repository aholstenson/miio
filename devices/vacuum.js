'use strict';

const Device = require('../device');

function checkResult(r) {
	if(r !== 0) {
		throw new Error('Could not complete call to device');
	}
}

/**
 * Implementation of the interface used by the Mi Robot Vacuum. This device
 * doesn't use properties via get_prop but instead has a get_status.
 */
class Vacuum extends Device {
	static get TYPE() { return 'vacuum' };

	constructor(options) {
		super(options);

		this.type = Vacuum.TYPE;

		this.defineProperty('state', s => {
			switch(s) {
				case 2:
					return 'charger-offline';
				case 5:
					return 'cleaning';
				case 6:
					return 'returning';
				case 8:
					return 'charging';
				case 10:
					return 'paused';
				case 11:
					return 'spot-cleaning';
			}
			return 'unknown-' + s;
		});
		this.defineProperty('error_code', e => {
			switch(e) {
				case 0:
					return null;
				default:
					return {
						code: e,
						message: 'unknown'
					};
			}

			// TODO: Find a list of error codes and map them correctly
		});

		this.defineProperty('battery');
		this.defineProperty('clean_time');
		this.defineProperty('clean_area');
		this.defineProperty('fan_power');
		this.defineProperty('in_cleaning');

		this.monitor();
	}

	get state() {
		return this.property('state');
	}

	start() {
		return this.call('app_start', [])
			.then(checkResult);
	}

	pause() {
		return this.call('app_pause', [])
			.then(checkResult);
	}

	stop() {
		return this.call('app_stop', [])
			.then(checkResult);
	}

	charge() {
		return this.call('app_stop', [])
			.then(checkResult)
			.then(() => this.call('app_charge', []))
			.then(checkResult);
	}

	spotClean() {
		return this.call('app_spot', [])
			.then(checkResult);
	}

	get charging() {
		return this.state == 'charging';
	}

	get cleaning() {
		switch(this.state) {
			case 'cleaning':
			case 'spot-cleaning':
				return true;
			default:
				return false;
		}
	}

	getProperties(props) {
		// We override getProperties to use get_status
		return this.call('get_status', [])
			.then(result => {
				const status = result[0];
				const mapped = {};
				props.forEach(prop => {
					mapped[prop] = this._mapProperty(prop, status[prop]);
				});
				return mapped;
			})
	}
}

module.exports = Vacuum;
