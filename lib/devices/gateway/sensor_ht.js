
const SubDevice = require('./subdevice');

class SensorHT extends SubDevice {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'sensor_ht';
		this.model = 'lumi.sensor_ht';

		this.defineProperty('temperature', v => v / 100.0);
		this.defineProperty('humidity', v => v / 100.0);
	}

	get temperature() {
		return this.property('temperature');
	}

	get humidity() {
		return this.property('humidity');
	}
}

module.exports = SensorHT;
