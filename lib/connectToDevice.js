'use strict';

const network = require('./network');

const Device = require('./device');
const models = require('./models');

module.exports = function(options) {
	let handle = network.ref();

	// Connecting to a device via IP, ask the network if it knows about it
	return network.findDeviceViaAddress(options)
		.then(device => {
			const deviceHandle = {
				ref: network.ref(),
				api: device
			};

			// Try to resolve the correct model, otherwise use the generic device
			const d = models[device.model];
			if(! d) {
				return new Device(deviceHandle);
			} else {
				return new d(deviceHandle);
			}
		})
		.catch(e => {
			// Error handling - make sure to always release the handle
			handle.release();

			throw e;
		})
		.then(device => {
			// Make sure to release the handle
			handle.release();

			return device.init();
		});
};
