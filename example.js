/* eslint-disable */

const miio = require('./lib');

// Create a new device over the given address
miio.device({
	address: '192.168.100.8'
}).then(device => {
	console.log(device);
	console.log(device.metadata);

	console.log(device.pm2_5);

	/*
	console.log('connected', device.modes());
	return device.mode('silent');

	if(device.metadata.hasCapability('power')) {
		console.log('power is currently', device.power());
		return device.togglePower();
	}*/

})
.then(p => console.log('got', p))
.catch(console.error);
