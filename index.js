'use strict';

const Device = require('./device');

const AirPurifier = require('./devices/air-purifier');
const Switch = require('./devices/switch');

const devices = {
	'zhimi-airpurifier-m1': AirPurifier,

	'chuangmi-plug-m1': Switch,
	'chuangmi-plug-v1': Switch,
	'chuangmi-plug-v2': Switch
};

module.exports.Device = Device;
module.exports.devices = devices;

/**
 * Create a device from from the given options. This will either create a
 * specific device if the type is known, or a generic device if it is unknown.
 *
 * Options:
 * * `address`, **required** the address to the device as an IP or hostname
 * * `port`, optional port number, if not specified the default 54391 will be used
 * * `model`, optional model if known, allows a more specific type to be returned
 */
module.exports.createDevice = function(options) {
	if(! options.address) throw new Error('Address to device is required');

	const d = devices[options.model];
	if(! d) {
		return new Device(options);
	} else {
		return new d(options);
	}
};

/**
 * Extract information about a device from its hostname on the local network.
 */
module.exports.infoFromHostname = function(hostname) {
	const m = /(.+)_miio(\d+)/g.exec(hostname);
	if(! m) return null;

	return {
		model: m[1],
		id: m[2]
	};
};
