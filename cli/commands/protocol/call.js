'use strict';

const chalk = require('chalk');
const log = require('../../log');
const deviceFinder = require('../../device-finder');
const tokens = require('../../../lib/tokens');

exports.command = 'call <idOrIp> <method> [params]';
exports.description = 'Call a raw method on a device';
exports.builder = {
};

exports.handler = function(argv) {
	let target = argv.idOrIp;
	log.info('Attempting to call', argv.method, 'on', target);

	let foundDevice = false;
	let pending = 0;
	const browser = deviceFinder({
		filter: target
	});
	browser.on('available', device => {
		pending++;

		log.plain();
		log.info('Device found, making call');
		log.plain();

		const parsedArgs = argv.params ? JSON.parse(argv.params) : [];
		device.miioCall(argv.method, parsedArgs)
			.then(result => {
				log.info('Got result:')
				log.plain(JSON.stringify(result, null, '  '));
			})
			.catch(err => {
				log.error('Encountered an error while controlling device');
				log.plain();
				log.plain('Error was:');
				log.plain(err.message);
			})
			.then(() => {
				pending--;
				process.exit(0);
			});
	});

	const doneHandler = () => {
		if(pending == 0) {
			if(! foundDevice) {
				log.warn('Could not find device');
			}
			process.exit(0);
		}
	};
	setTimeout(doneHandler, 5000);
	browser.on('done', doneHandler);
};
