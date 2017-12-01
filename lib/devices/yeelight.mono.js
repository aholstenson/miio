'use strict';

const { Yeelight, ColorTemperature } = require('./yeelight');

module.exports = class YeelightMono extends Yeelight.with(ColorTemperature) {
	constructor(options) {
		super(options);
	}
};
