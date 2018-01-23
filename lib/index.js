'use strict';

const discovery = require('./discovery');

/**
 * Get information about the models supported. Can be used to extend the models
 * supported.
 */
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
