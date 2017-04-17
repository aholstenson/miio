/**
 * Mapping from models into high-level devices.
 */
const AirPurifier = require('./devices/air-purifier');
const Switch = require('./devices/switch');
const Vacuum = require('./devices/vacuum');
const Gateway = require('./devices/gateway');
const PowerStrip = require('./devices/powerstrip');

module.exports = {
	'zhimi.airpurifier.m1': AirPurifier,
	'zhimi.airpurifier.v1': AirPurifier,
	'zhimi.airpurifier.v2': AirPurifier,
	'zhimi.airpurifier.v6': AirPurifier,

	'chuangmi.plug.m1': Switch,
	'chuangmi.plug.v1': require('./devices/chuangmi.plug.v1'),
	'chuangmi.plug.v2': Switch,

	'rockrobo.vacuum.v1': Vacuum,

	'lumi.gateway.v2': Gateway,
	'lumi.gateway.v3': Gateway,

	'qmi.powerstrip.v1': PowerStrip,
	'zimi.powerstrip.v2': PowerStrip
};
