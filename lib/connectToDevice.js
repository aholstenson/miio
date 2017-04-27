'use strict';

const createDevice = require('./createDevice');

module.exports = function(options) {
	let device = createDevice(options);
	return device.call('miIO.info')
		.then(data => {
			if(options.model) {
				// If the model was specified we reuse the device instance
			} else {
				// If the model was automatically discovered recreate the device
				device.destroy();
				device = createDevice(Object.assign({}, options, {
					model: data.model,
					token: data.token
				}));
			}
		})
		.then(() => {
			return device.init()
				.then(() => device);
		})
		.catch(err => {
			device.destroy();
			throw err;
		});
};
