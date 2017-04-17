/* eslint-disable */

const miio = require('./lib');

// Create a new device over the given address
miio.device({
	model: 'zhimi.airpurifier.m1',
	address: '192.168.100.8'
}).then(device => {
	console.log('power is now', device.power);
	return device.setPower(! device.power);
}).catch(console.error);
