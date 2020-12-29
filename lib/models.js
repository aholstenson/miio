'use strict';

/**
 * Mapping from models into high-level devices.
 */
const AirMonitor = require('./devices/air-monitor');
const AirPurifier = require('./devices/air-purifier');
const AirPurifier3 = require('./devices/air-purifier3');
const Gateway = require('./devices/gateway');

const Vacuum = require('./devices/vacuum');

const PowerPlug = require('./devices/power-plug');
const PowerStrip = require('./devices/power-strip');

const Humidifier = require('./devices/humidifier');

const YeelightColor = require('./devices/yeelight.color');
const YeelightMono = require('./devices/yeelight.mono');

module.exports = {
	'zhimi.airmonitor.v1': AirMonitor,

	// Air Purifier 1 (and Pro?)
	'zhimi.airpurifier.v1': AirPurifier,
	'zhimi.airpurifier.v2': AirPurifier,
	'zhimi.airpurifier.v3': AirPurifier,
	'zhimi.airpurifier.v6': AirPurifier,

	// Air Purifier 2
	'zhimi.airpurifier.m1': AirPurifier,
	'zhimi.airpurifier.m2': AirPurifier,
	'zhimi.airpurifier.mc2': AirPurifier,

	// Air Purifier 2S
	'zhimi.airpurifier.ma2': AirPurifier,
	'zhimi.airpurifier.mc1': AirPurifier,
	
	// Air Purifier 2H
	'zhimi.airpurifier.mc2': AirPurifier,
	// Air Purifier 3
	'zhimi.airpurifier.mb3': AirPurifier3,	
	
	'zhimi.humidifier.v1': Humidifier,

	'chuangmi.plug.m1': PowerPlug,
	'chuangmi.plug.v1': require('./devices/chuangmi.plug.v1'),
	'chuangmi.plug.v2': PowerPlug,
	'chuangmi.plug.m3': PowerPlug,
	'chuangmi.plug.hmi206': PowerPlug,

	'rockrobo.vacuum.v1': Vacuum,
	'roborock.vacuum.s5': Vacuum,
	'roborock.vacuum.s5e': Vacuum,
	'roborock.vacuum.a10': Vacuum,
	'roborock.vacuum.m1s': Vacuum,

	'lumi.gateway.v2': Gateway.WithLightAndSensor,
	'lumi.gateway.v3': Gateway.WithLightAndSensor,
	'lumi.gateway.mgl03': Gateway.WithLightAndSensor,
	'lumi.acpartner.v1': Gateway.Basic,
	'lumi.acpartner.v2': Gateway.Basic,
	'lumi.acpartner.v3': Gateway.Basic,

	'qmi.powerstrip.v1': PowerStrip,
	'zimi.powerstrip.v2': PowerStrip,

	'yeelink.light.lamp1': YeelightMono,
	'yeelink.light.lamp2': YeelightMono,
	'yeelink.light.mono1': YeelightMono,
	'yeelink.light.color1': YeelightColor,
	'yeelink.light.strip1': YeelightColor,
	'yeelink.light.strip2': YeelightColor,

	'philips.light.sread1': require('./devices/eyecare-lamp2'),
	'philips.light.bulb': require('./devices/philips-light-bulb')

};
