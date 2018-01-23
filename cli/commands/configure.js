'use strict';

const log = require('../log');
const deviceFinder = require('../device-finder');

const tokens = require('../../lib/tokens');

exports.command = 'configure <idOrIp>';
exports.description = 'Control a device by invoking the given method';
exports.builder = {
	ssid: {
		required: true,
		description: 'SSID of the WiFi network'
	},

	passwd: {
		required: true,
		description: 'Password of WiFi-network'
	}
};

exports.handler = function(argv) {
	let target = argv.idOrIp;
	log.info('Attempting to configure', target);

	let foundDevice = false;
	let pending = 0;
	const browser = deviceFinder({
		filter: target
	});
	browser.on('available', device => {
		pending++;

		log.plain();

		device.management.updateWireless({
			ssid: argv.ssid,
			passwd: argv.passwd
		})
			.then(result => {
				log.plain('Updated wireless configuration');

				return tokens.update(device.id, device.management.token);
			})
			.catch(err => {
				log.error('Encountered an error while updating wireless');
				log.plain();
				log.plain('Error was:');
				log.plain(err.message);
			})
			.then(() => {
				pending--;
				process.exit(0); // eslint-disable-line
			});
	});

	const doneHandler = () => {
		if(pending === 0) {
			if(! foundDevice) {
				log.warn('Could not find device');
			}
			process.exit(0); // eslint-disable-line
		}
	};
	setTimeout(doneHandler, 5000);
	browser.on('done', doneHandler);
};
