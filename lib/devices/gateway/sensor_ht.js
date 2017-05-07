'use strict';


const SubDevice = require('./subdevice');
const Sensor = require('../capabilities/sensor');

class SensorHT extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'sensor';
		this.model = 'lumi.sensor_ht';

		this.defineProperty('temperature', v => v / 100.0);
		Sensor.extend(this, { name: 'temperature' });

		this.defineProperty('humidity', v => v / 100.0);
		Sensor.extend(this, { name: 'humidity' });
	}
}

module.exports = SensorHT;
