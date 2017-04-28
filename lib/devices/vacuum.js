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
	static get TYPE() { return 'vacuum' }

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
		this.defineProperty('error_code', {
			name: 'error',
			mapper: e => {
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
			}
		});

		this.defineProperty('battery');
		this.defineProperty('clean_time', {
			name: 'cleanTime',
		});
		this.defineProperty('clean_area', {
			name: 'cleanArea',
			mapper: v => v / 1000000
		});
		this.defineProperty('fan_power', {
			name: 'fanPower'
		});
		this.defineProperty('in_cleaning');

		// Consumable status - times for brushes and filters
		this.defineProperty('main_brush_work_time', {
			name: 'mainBrushWorkTime'
		});
		this.defineProperty('side_brush_work_time', {
			name: 'sideBrushWorkTime'
		});
		this.defineProperty('filterWorkTime', {
			name: 'filterWorkTime'
		});
		this.defineProperty('sensorDirtyTime', {
			name: 'sensorDirtyTime'
		});

		this._monitorInterval = 60000;
	}

	/**
	 * Get the state of the vacuum.
	 */
	get state() {
		return this.property('state');
	}

	/**
	 * Start a cleaning session.
	 */
	start() {
		return this.call('app_start', [])
			.then(checkResult);
	}

	/**
	 * Pause the current cleaning session.
	 */
	pause() {
		return this.call('app_pause', [])
			.then(checkResult);
	}

	/**
	 * Stop the current cleaning session.
	 */
	stop() {
		return this.call('app_stop', [])
			.then(checkResult);
	}

	/**
	 * Stop the current cleaning session and return to charge.
	 */
	charge() {
		return this.call('app_stop', [])
			.then(checkResult)
			.then(() => this.call('app_charge', []))
			.then(checkResult);
	}

	/**
	 * Start cleaning the current spot.
	 */
	spotClean() {
		return this.call('app_spot', [])
			.then(checkResult);
	}

	/**
	 * Get if the device is charging.
	 */
	get charging() {
		return this.state == 'charging';
	}

	/**
	 * Get if the device is cleaning.
	 */
	get cleaning() {
		switch(this.state) {
			case 'cleaning':
			case 'spot-cleaning':
				return true;
			default:
				return false;
		}
	}

	/**
	 * Get the battery level in percent.
	 */
	get battery() {
		return this.property('battery');
	}

	/**
	 * Get the power of the fan.
	 */
	get fanPower() {
		return this.property('fanPower');
	}

	/**
	 * Set the power of the fan. Usually 38, 60 or 77.
	 */
	setFanPower(power) {
		if(typeof power !== 'number' || power < 0 || power > 100) {
			throw new Error('Power must be a number between 0 and 100');
		}

		return this.call('set_custom_mode', [ power ])
			.then(() => {
				return power;
			});
	}

	/**
	 * Activate the find function, will make the device give off a sound.
	 */
	find() {
		return this.call('find_me', [''])
			.then(() => null);
	}

	/**
	 * Get information about the cleaning history of the device. Contains
	 * information about the number of times it has been started and
	 * the days it has been run.
	 */
	getHistory() {
		return this.call('get_clean_summary')
			.then(result => {
				return {
					count: result[2],
					days: result[3].map(ts => new Date(ts * 1000))
				}
			});
	}

	/**
	 * Get history for the specified day. The day should be fetched from
	 * `getHistory`.
	 */
	getHistoryForDay(day) {
		let record = day;
		if(record instanceof Date) {
			record = Math.floor(record.getTime() / 1000);
		}
		return this.call('get_clean_record', [ record ])
			.then(result => ({
				day: day,
				history: result.map(data => ({
					// Start and end times
					start: new Date(data[0] * 1000),
					end: new Date(data[1] * 1000),

					// How long it took in seconds
					duration: data[2],

					// Area in m2
					area: data[3] / 1000000,

					// If it was a complete run
					complete: data[5] === 1
				}))
			}));
	}

	loadProperties(props) {
		// We override loadProperties to use get_status and get_consumables
		return Promise.all([
			this.call('get_status'),
			this.call('get_consumable')
		]).then(result => {
			const status = result[0][0];
			const consumables = result[1][0];

			const mapped = {};
			props.forEach(prop => {
				let value = status[prop];
				if(typeof value === 'undefined') {
					value = consumables[prop];
				}
				this._pushProperty(mapped, prop, value);
			});
			return mapped;
		});
	}
}

module.exports = Vacuum;
