'use strict';


const models = require('./models');

module.exports = function(hostname) {
	// Extract info via hostname structure
	const m = /(.+)_miio(\d+)/g.exec(hostname);
	if(! m) {
		// Fallback for rockrobo - might break in the future
		if(/rockrobo/g.exec(hostname)) {
			return {
				model: 'rockrobo.vacuum.v1',
				type: 'vacuum'
			}
		}

		return null;
	}

	const model = m[1].replace(/-/g, '.');

	const device = models[model];
	return {
		model: model,
		type: (device && device.TYPE) || 'generic',
		id: m[2]
	};
}
