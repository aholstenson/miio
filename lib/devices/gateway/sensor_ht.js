'use strict';


const SubDevice = require('./subdevice');
const { Temperature, Humidity } = require('../capabilities/sensor');
const Voltage = require('./voltage');

module.exports = class SensorHT extends SubDevice.with(Temperature, Humidity, Voltage) {
	constructor(parent, info) {
		super(parent, info);

		this.miioModel = 'lumi.sensor_ht';

		this.defineProperty('temperature', v => v / 100.0);
		this.defineProperty('humidity', v => v / 100.0);
	}
};
