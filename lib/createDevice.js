'use strict';

const Device = require('./device');
const models = require('./models');

module.exports = function(options) {
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
