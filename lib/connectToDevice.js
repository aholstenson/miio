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
				device._fastDestroy();

				device = createDevice(Object.assign({}, options, {
					model: data.model,
					token: data.token
				}));
			}
		})
		.then(() => device.init())
		.catch(err => {
			// In case initialization was skipped
			device._fastDestroy();

			// Perform full destroy
			device.destroy();
			throw err;
		});
};
