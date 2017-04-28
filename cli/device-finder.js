'use strict';

const { EventEmitter } = require('events');
const { Browser, Devices } = require('../lib/discovery');

function asFilter(filter) {
	if(typeof filter === 'string') {
		return reg => reg.id === filter || reg.address === filter || reg.model === filter || reg.type === filter;
	} else if(typeof filter === 'function') {
		return filter;
	} else {
		return () => true;
	}
}

function asToplevelFilter(filter) {
	return reg => reg.type === 'gateway' || filter(reg);
}

module.exports = function(options) {
	const filter = asFilter(options.filter);
	let browser;
	if(options.instances) {
		browser = new Devices({
			cacheTime: options.cacheTime || 300,
			filter: options.filter ? asToplevelFilter(filter) : null
		});
	} else {
		browser = new Browser({
			cachetime: options.cacheTime || 300
		});
	}

	const result = new EventEmitter();
	browser.on('available', reg => {
		if(filter(reg)) {
			result.emit('available', reg);
		}
	});
	browser.on('unavailable', reg => result.emit('unavailable', reg));
	return result;
};
