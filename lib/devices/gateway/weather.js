'use strict';


const SubDevice = require('./subdevice');
const { Temperature, Humidity, AtmosphericPressure } = require('../capabilities/sensor');
const Voltage = require('./voltage');

module.exports = class WeatherSensor extends SubDevice
	.with(Temperature, Humidity, AtmosphericPressure,  Voltage)
{
	constructor(parent, info) {
		super(parent, info);

		this.miioModel = 'lumi.weather';

		this.defineProperty('temperature', v => v / 100.0);
		this.defineProperty('humidity', v => v / 100.0);
		this.defineProperty('pressure', {
			name: 'atmosphericPressure'
		});
	}
};
