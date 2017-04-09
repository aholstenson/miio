/* eslint-disable */

const miio = require('./lib');

// Create a new device over the given address
const device = miio.createDevice({
	model: 'zhimi.airpurifier.m1',
	address: '192.168.100.8'
});

// Call any method via call
device.call('set_mode', [ 'silent' ])
	.then(console.log)
	.catch(console.error);


// Or use some of the built-in methods
device.setPower(false);

device.getProperties([ 'power', 'mode', 'aqi', 'temp_dec', 'humidity' ])
	.then(console.log)
	.catch(console.error);
