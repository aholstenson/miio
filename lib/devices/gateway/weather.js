'use strict';


const SubDevice = require('./subdevice');
const { Temperature, Humidity, AtmosphericPressure } = require('../capabilities/sensor');

module.exports = class WeatherSensor extends SubDevice.with(Temperature, Humidity, AtmosphericPressure) {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'sensor';
		this.model = 'lumi.weather';

		this.defineProperty('temperature', v => v / 100.0);
		this.defineProperty('humidity', v => v / 100.0);
		this.defineProperty('atmosphericPressure', v => v / 1000.0);
	}
};
