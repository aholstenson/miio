'use strict';

const { ChargingState } = require('abstract-things');
const { AirMonitor } = require('abstract-things/climate');
const MiioApi = require('../device');

const Power = require('./capabilities/power');
const BatteryLevel = require('./capabilities/battery-level');
const { AQI } = require('./capabilities/sensor');

module.exports = class extends AirMonitor
	.with(MiioApi, Power, AQI, BatteryLevel, ChargingState)
{

	static get type() {
		return 'miio:air-monitor';
	}

	constructor(options) {
		super(options);

		// Define the power property
		this.defineProperty('power', v => v === 'on');

		// Sensor value used for AQI (PM2.5) capability
		this.defineProperty('aqi');

		this.defineProperty('battery', {
			name: 'batteryLevel'
		});

		this.defineProperty('usb_state', {
			name: 'charging',
			mapper: v => v === 'on'
		});
	}

	propertyUpdated(key, value, oldValue) {
		if(key === 'charging') {
			this.updateCharging(value);
		}

		super.propertyUpdated(key, value, oldValue);
	}

	changePower(power) {
		return this.call('set_power', [ power ? 'on' : 'off' ], {
			refresh: [ 'power', 'mode' ],
			refreshDelay: 200
		});
	}

};
