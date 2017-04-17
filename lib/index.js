'use strict';

const Discovery = require('./discovery');
const Device = require('./device');

module.exports.Device = Device;
const models = module.exports.models = require('./models');

/**
 * Resolve a device from the given options.
 *
 * Options:
 * * `address`, **required** the address to the device as an IP or hostname
 * * `port`, optional port number, if not specified the default 54321 will be used
 * * `token`, optional token of the device
 */
module.exports.device = function(options) {
	if(! options.address) throw new Error('Address to device is required');

	// Create a temporary device and fetch info from device
	const temp = new Device(options);
	return temp.call('miIO.info')
		.then(data => {
			temp.destroy();
			return createDevice({
				id: options.id,
				address: options.address,
				port: options.port,
				model: data.model,
				token: data.token
			});
		})
		.then(device => {
			return device.init()
				.then(() => device);
		})
		.catch(err => {
			temp.destroy();
			throw err;
		});
};

/**
 * Create a device from the given options. This will either create a
 * specific device if the type is known, or a generic device if it is unknown.
 *
 * Options:
 * * `address`, **required** the address to the device as an IP or hostname
 * * `port`, optional port number, if not specified the default 54391 will be used
 * * `model`, optional model if known, allows a more specific type to be returned
 * * `token`, optional token of the device
 */
const createDevice = module.exports.createDevice = function(options) {
	if(! options.address) throw new Error('Address to device is required');

	const d = models[options.model];
	let device;
	if(! d) {
		device = new Device(options);
	} else {
		device = new d(options);
	}

	return device;
};

/**
 * Extract information about a device from its hostname on the local network.
 */
module.exports.infoFromHostname = require('./infoFromHostname.js');

module.exports.browser = function(options) {
	const cacheTime = options && options.cacheTime ? options.cacheTime : 1800;
	return new Discovery(cacheTime);
};
