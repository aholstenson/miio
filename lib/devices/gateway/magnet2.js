'use strict';

const Magnet = require('./magnet');

module.exports = class Magnet2 extends Magnet {

	constructor(...args) {
		super(...args);

		this.miioModel = 'lumi.magnet.aq2';
	}

};
