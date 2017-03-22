'use strict';

const Device = require('./device');

const devices = {
	'zhimi-airpurifier-m1': require('./devices/air-purifier')
};

module.exports.Device = Device;
module.exports.devices = devices;
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
