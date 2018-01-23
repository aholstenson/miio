'use strict';

const { EventEmitter } = require('events');
const { Devices } = require('../lib/discovery');
const connectToDevice = require('../lib/connectToDevice');

const IP = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

function asFilter(filter) {
	if(typeof filter === 'number') {
		filter = String(filter);
	}

	if(typeof filter === 'string') {
		return reg => {
			return String(reg.id) === filter || reg.address === filter || reg.model === filter;
		};
	} else if(typeof filter === 'function') {
		return filter;
	} else {
		return () => true;
	}
}

function asToplevelFilter(filter) {
	return reg => reg.type === 'gateway' || filter(reg);
}

module.exports = function(options={}) {
	const result = new EventEmitter();

	if(typeof options.filter === 'string' && options.filter.match(IP)) {
		// IP-address specified
		connectToDevice({
			address: options.filter,
			withPlaceholder: true
		})
			.then(device => result.emit('available', device))
			.catch(() => result.emit('done'));
	} else {
		//
		const filter = asFilter(options.filter);
		const browser = new Devices({
			cacheTime: options.cacheTime || 300,
			filter: options.filter ? asToplevelFilter(filter) : null,
		});

		browser.on('available', reg => {
			if(filter(reg)) {
				result.emit('available', reg.device);
			}
		});
		browser.on('unavailable', reg => result.emit('unavailable', reg.device));
	}
	return result;
};
