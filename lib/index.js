'use strict';

const discovery = require('./discovery');
const Device = require('./device');

module.exports.Device = Device;
module.exports.models = require('./models');

/**
 * Resolve a device from the given options.
 *
 * Options:
 * * `address`, **required** the address to the device as an IP or hostname
 * * `port`, optional port number, if not specified the default 54321 will be used
 * * `token`, optional token of the device
 */
module.exports.device = require('./connectToDevice');

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
module.exports.createDevice = require('./createDevice');

/**
 * Extract information about a device from its hostname on the local network.
 */
module.exports.infoFromHostname = require('./infoFromHostname');

/**
 * Browse for devices available on the network. Will not automatically
 * connect to them.
 */
module.exports.browse = function(options) {
	return new discovery.Browser(options || {});
};

/**
 * Get access to all devices on the current network. Will find and connect to
 * devices automatically.
 */
module.exports.devices = function(options) {
	return new discovery.Devices(options || {});
};
