'use strict';

const log = require('../log');
const deviceFinder = require('../device-finder');

exports.command = 'control <idOrIp> <method> [params..]';
exports.description = 'Control a device by invoking the given method';
exports.builder = {
};

exports.handler = function(argv) {
	let target = argv.idOrIp;
	log.info('Attempting to invoke', argv.method, 'on', target);

	let foundDevice = false;
	let pending = 0;
	const browser = deviceFinder({
		filter: target
	});
	browser.on('available', device => {
		if(! device[argv.method]) {
			log.error('The method ' + argv.method + ' is not available');
			process.exit(0); // eslint-disable-line
		}

		pending++;

		Promise.resolve(device[argv.method](...argv.params))
			.then(result => {
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
