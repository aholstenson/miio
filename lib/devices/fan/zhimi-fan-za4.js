'use strict';

const ZhiMiFan = require('./zhimi-fan');

module.exports = class extends ZhiMiFan {
	static get type() {
		return 'miio:zhimi-fan-2s';
	}

	constructor(options) {
		super(options);

		this.defineProperty('power');
	}
};
