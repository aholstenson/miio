'use strict';

const { ChargingState, AutonomousCharging } = require('abstract-things');
const {
	Vacuum, AdjustableFanSpeed, AutonomousCleaning, SpotCleaning
} = require('abstract-things/climate');

const MiioApi = require('../device');
const BatteryLevel = require('./capabilities/battery-level');

function checkResult(r) {
	if(r !== 0) {
		throw new Error('Could not complete call to device');
	}
}

/**
 * Implementation of the interface used by the Mi Robot Vacuum. This device
 * doesn't use properties via get_prop but instead has a get_status.
 */
module.exports = class extends Vacuum.with(
	MiioApi, BatteryLevel, AutonomousCharging, AutonomousCleaning,
	SpotCleaning, AdjustableFanSpeed, ChargingState
) {
	static get type() {
		return 'miio:vacuum';
	}

	constructor(options) {
		super(options);

		this.defineProperty('error_code', {
			name: 'error',
			mapper: e => {
				switch(e) {
					case 0:
						return null;
					default:
						return {
							code: e,
							message: 'Unknown error ' + e
						};
				}

				// TODO: Find a list of error codes and map them correctly
			}
		});

		this.defineProperty('state', s => {
			switch(s) {
				case 1:
					return 'initiating';
				case 2:
					return 'charger-offline';
				case 3:
					return 'waiting';
				case 5:
					return 'cleaning';
				case 6:
					return 'returning';
				case 8:
					return 'charging';
				case 9:
					return 'charging-error';
				case 10:
					return 'paused';
				case 11:
					return 'spot-cleaning';
				case 12:
					return 'error';
				case 13:
					return 'shutting-down';
				case 14:
					return 'updating';
				case 15:
					return 'docking';
				case 17:
					return 'zone-cleaning';
				case 100:
					return 'full';
			}
			return 'unknown-' + s;
		});

		// Define the batteryLevel property for monitoring battery
		this.defineProperty('battery', {
			name: 'batteryLevel'
		});

		this.defineProperty('clean_time', {
			name: 'cleanTime',
		});
		this.defineProperty('clean_area', {
			name: 'cleanArea',
			mapper: v => v / 1000000
		});
		this.defineProperty('fan_power', {
			name: 'fanSpeed'
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

	propertyUpdated(key, value, oldValue) {
		if(key === 'state') {
			// Update charging state
			this.updateCharging(value === 'charging');

			switch(value) {
				case 'cleaning':
				case 'spot-cleaning':
				case 'zone-cleaning':
					// The vacuum is cleaning
					this.updateCleaning(true);
					break;
				case 'paused':
					// Cleaning has been paused, do nothing special
					break;
				case 'error':
					// An error has occurred, rely on error mapping
					this.updateError(this.property('error'));
					break;
				case 'charging-error':
					// Charging error, trigger an error
					this.updateError({
						code: 'charging-error',
						message: 'Error during charging'
					});
					break;
				case 'charger-offline':
					// Charger is offline, trigger an error
					this.updateError({
						code: 'charger-offline',
						message: 'Charger is offline'
					});
					break;
				default:
					// The vacuum is not cleaning
					this.updateCleaning(false);
					break;
			}
		} else if(key === 'fanSpeed') {
			this.updateFanSpeed(value);
		}

		super.propertyUpdated(key, value, oldValue);
	}

	/**
	 * Start a cleaning session.
	 */
	activateCleaning() {
		return this.call('app_start', [], {
			refresh: [ 'state' ],
			refreshDelay: 1000
		})
			.then(checkResult);
	}

	/**
	 * Pause the current cleaning session.
	 */
	pause() {
		return this.call('app_pause', [], {
			refresh: [ 'state ']
		})
			.then(checkResult);
	}

	/**
	 * Stop the current cleaning session.
	 */
	deactivateCleaning() {
		return this.call('app_stop', [], {
			refresh: [ 'state' ],
			refreshDelay: 1000
		})
			.then(checkResult);
	}

	/**
	 * Stop the current cleaning session and return to charge.
	 */
	activateCharging() {
		return this.call('app_stop', [])
			.then(checkResult)
			.then(() => this.call('app_charge', [], {
				refresh: [ 'state' ],
				refreshDelay: 1000
			}))
			.then(checkResult);
	}

	/**
	 * Start cleaning the current spot.
	 */
	activateSpotClean() {
		return this.call('app_spot', [], {
			refresh: [ 'state' ]
		})
			.then(checkResult);
	}

	/**
	 * Set the power of the fan. Usually 38, 60 or 77.
	 */
	changeFanSpeed(speed) {
		return this.call('set_custom_mode', [ speed ], {
			refresh: [ 'fanSpeed' ]
		})
			.then(checkResult);
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
				};
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
		props = props.map(key => this._reversePropertyDefinitions[key] || key);

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
};
