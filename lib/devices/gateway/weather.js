'use strict';


const SubDevice = require('./subdevice');
const Sensor = require('../capabilities/sensor');

class WeatherSensor extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'sensor';
		this.model = 'lumi.weather';

		this.defineProperty('temperature', v => v / 100.0);
		Sensor.extend(this, { name: 'temperature' });

		this.defineProperty('humidity', v => v / 100.0);
		Sensor.extend(this, { name: 'humidity' });

		this.defineProperty('pressure', v => v / 1000.0);
		Sensor.extend(this, { name: 'pressure' });
	}
}

module.exports = WeatherSensor;
