'use strict';

const log = require('../log');
const deviceFinder = require('../device-finder');
const tokens = require('../../lib/tokens');

exports.command = 'discover';
exports.description = 'Discover devices on the local network';
exports.builder = {
	'sync': {
		type: 'boolean',
		description: 'Synchronize tokens'
	}
};

exports.handler = function(argv) {
	log.info('Discovering devices. Press Ctrl+C to stop.');
	log.plain();

	const browser = deviceFinder();
	browser.on('available', device => {
		try {
			log.device(device);
		} catch(ex) {
			log.error(ex);
		}

		const mgmt = device.management;
		if(argv.sync && mgmt.token && mgmt.autoToken) {
			tokens.update(device.id, mgmt.token)
				.catch(err => {
					log.error('Could not update token for', device.id, ':', err);
				});
		}
	});
};
