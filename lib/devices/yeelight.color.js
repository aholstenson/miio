'use strict';

const { Yeelight, ColorFull } = require('./yeelight');

module.exports = class YeelightColor extends Yeelight.with(ColorFull) {
};
