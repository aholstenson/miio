'use strict';

const Discovery = require('./discovery');
const Device = require('./device');

const AirPurifier = require('./devices/air-purifier');
const Switch = require('./devices/switch');
const Vacuum = require('./devices/vacuum');
const Gateway = require('./devices/gateway');

const devices = {
	'zhimi.airpurifier.m1': AirPurifier,
	'zhimi.airpurifier.v1': AirPurifier,
	'zhimi.airpurifier.v2': AirPurifier,
	'zhimi.airpurifier.v6': AirPurifier,

	'chuangmi.plug.m1': Switch,
	'chuangmi.plug.v1': Switch,
	'chuangmi.plug.v2': Switch,

	'rockrobo.vacuum.v1': Vacuum,

	'lumi.gateway.v2': Gateway,
	'lumi.gateway.v3': Gateway,
};

module.exports.Device = Device;
module.exports.devices = devices;

/**
 * Resolve a device from the given options.
 *
 * Options:
 * * `address`, **required** the address to the device as an IP or hostname
 * * `port`, optional port number, if not specified the default 54391 will be used
 * * `token`, optional token of the device
 */
module.exports.device = function(options) {
	// Create a temporary device and fetch info from device
	const temp = new Device(options);
	return temp.call('miIO.info')
		.then(data => {
			temp.destroy();
			return createDevice({
				address: options.address,
				port: options.port,
				model: data.model,
				token: data.token
			});
		})
		.then(device => {
			return device.init()
				.then(() => device);
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

	const d = devices[options.model];
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
module.exports.infoFromHostname = function(hostname) {
	const m = /(.+)_miio(\d+)/g.exec(hostname);
	if(! m) return null;

	const model = m[1].replace(/-/g, '.');

	const device = devices[model];
	return {
		model: model,
		type: (device && device.TYPE) || 'generic',
		id: m[2]
	};
};

module.exports.browser = function(options) {
	const cacheTime = options && options.cacheTime ? options.cacheTime : 1800;
	return new Discovery(cacheTime);
};
