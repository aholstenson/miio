'use strict';

const ZhiMiFan = require('./zhimi-fan');

module.exports = class extends ZhiMiFan {
	static get type() {
		return 'miio:zhimi-fan-2';
	}

	constructor(options) {
		super(options);

		this.defineProperty('ac_power', {
			name: 'power'
		});
	}
};
