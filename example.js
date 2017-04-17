/* eslint-disable */

const miio = require('./lib');

// Create a new device over the given address
miio.device({
	address: '192.168.100.8'
}).then(device => {
	if(device.hasCapability('power')) {
		console.log('power is now', device.power);
		return device.setPower(! device.power);
	}
}).catch(console.error);
