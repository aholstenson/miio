
const models = require('./models');

module.exports = function(hostname) {
	// Extract info via hostname structure
	const m = /(.+)_miio(\d+)/g.exec(hostname);
	if(! m) return null;

	const model = m[1].replace(/-/g, '.');

	const device = models[model];
	return {
		model: model,
		type: (device && device.TYPE) || 'generic',
		id: m[2]
	};
}
