'use strict';

/**
 * Mapping from models into high-level devices.
 */
const AirPurifier = require('./devices/air-purifier');
const Gateway = require('./devices/gateway');

const Vacuum = require('./devices/vacuum');

const PowerPlug = require('./devices/power-plug');
const PowerStrip = require('./devices/power-strip');

const Humidifier = require('./devices/humidifier');

module.exports = {
	'zhimi.airpurifier.m1': AirPurifier,
	'zhimi.airpurifier.m2': AirPurifier,
	'zhimi.airpurifier.v1': AirPurifier,
	'zhimi.airpurifier.v2': AirPurifier,
	'zhimi.airpurifier.v3': AirPurifier,
	'zhimi.airpurifier.v6': AirPurifier,

	'zhimi.humidifier.v1': Humidifier,

	'chuangmi.plug.m1': PowerPlug,
	'chuangmi.plug.v1': require('./devices/chuangmi.plug.v1'),
	'chuangmi.plug.v2': PowerPlug,

	'rockrobo.vacuum.v1': Vacuum,

	'lumi.gateway.v2': Gateway,
	'lumi.gateway.v3': Gateway,
	'lumi.acpartner.v1': Gateway,

	'qmi.powerstrip.v1': PowerStrip,
	'zimi.powerstrip.v2': PowerStrip,

	'yeelink.light.lamp1': require('./devices/yeelight.lamp'),
	'yeelink.light.mono1': require('./devices/yeelight.mono'),
	'yeelink.light.color1': require('./devices/yeelight.color'),
	'philips.light.sread1': require('./devices/eyecare-lamp2'),
	'philips.light.bulb': require('./devices/philips-light-bulb')
	
};
