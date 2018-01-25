'use strict';

module.exports = {
	// Switch (button) controller
	1: require('./switch'),
	// Motion sensor
	2: require('./motion'),
	// Magnet sensor for doors and windows
	3: require('./magnet'),

	// TODO: What is 4, 5 and 6? plug, 86sw1 and 86sw2 are left

	// Light switch with two channels
	7: require('./ctrl_neutral2'),
	// Cube controller
	8: require('./cube'),
	// Light switch with one channel
	9: require('./ctrl_neutral1'),
	// Temperature and Humidity sensor
	10: require('./sensor_ht'),
	// Plug
	11: require('./plug'),

	// Aqara Temperature/Humidity/Pressure sensor
	19: require('./weather'),
	// Light switch (live+neutral wire version) with one channel
	20: require('./ctrl_ln1'),
	// Light switch (live+neutral wire version) with two channels
	21: require('./ctrl_ln2'),

	// AQ2 switch (square version)
	51: require('./switch2'),
	// AQ2 motion sensor
	52: require('./motion2'),
	// AQ2 manget sensor
	53: require('./magnet2')
};
