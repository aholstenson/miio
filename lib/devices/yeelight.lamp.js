'use strict';

const { Yeelight, ColorTemperature } = require('./yeelight');

module.exports = class YeelightLamp extends Yeelight.with(ColorTemperature) {
	constructor(options) {
		super(options);
	}
};
