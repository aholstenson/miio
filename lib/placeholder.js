'use strict';

const { Thing } = require('abstract-things');
const MiioApi = require('./device');

module.exports = class extends Thing.with(MiioApi) {

	static get type() {
		return 'placeholder';
	}

};
