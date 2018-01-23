'use strict';

const log = require('../../log');
const deviceFinder = require('../../device-finder');

exports.command = 'update <idOrIp>';
exports.description = 'Update the token to use for the given device';
exports.builder = {
	token: {
		required: true,
		description: 'The token to set'
	}
};

exports.handler = function(argv) {
	let target = argv.idOrIp;
	log.info('Updating token for', target);

	let foundDevice = false;
	let pending = 0;
	const browser = deviceFinder({
		filter: target
	});
	browser.on('available', device => {
		pending++;

		log.plain();
		log.info('Connected to', device.id, ' - trying to change token');
		log.plain();

		device.management.updateToken(argv.token)
			.then(status => {
				if(status) {
					log.plain('Token has been updated');
				} else {
					log.error('Could not update token, double-check the given token');
				}
			})
			.catch(err => {
				log.error('Could update token. Error was:', err.message);
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
