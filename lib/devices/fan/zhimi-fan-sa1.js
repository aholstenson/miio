'use strict';

const ZhiMiFan = require('./zhimi-fan');

module.exports = class extends ZhiMiFan {
	static get type() {
		return 'miio:mi-fan-1';
	}

	constructor(options) {
		super(options);

		this.defineProperty('power');
	}
};
