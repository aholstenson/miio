'use strict';

module.exports = function(str) {
	try {
		return JSON.parse(str);
	} catch(ex) {
		// Case 1: Load for subdevices fail as they return empty values
		str = str.replace('[,]', '[null,null]');
		// for aqara body sensor (lumi.motion.aq2)
		str = str.replace('[,,]', '[null,null,null]');

		return JSON.parse(str);
	}
};
