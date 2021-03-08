'use strict';

const { Thing } = require('abstract-things');
const { PowerPlug, PowerOutlet } = require('abstract-things/electrical');
const MiioApi = require('../device');
const Power = require('./capabilities/power');

module.exports = class extends Thing
	.with(PowerPlug, PowerOutlet, MiioApi, Power)
{
	static get type() {
		return 'miio:power-plug212a01';
	}

	constructor(options) {
		super(options);

		this.defineProperty('power');
	}

	changePower(power) {
		return this.call(
			'set_properties',
			[{ did: 'MYDID', siid: 2, piid: 1, value: Boolean(power) }],
			{ refresh: true }
		);
	}

	propertyUpdated(key, value) {
		if (key === 'power') {
			this.changePower(value);
		}
	}

	loadProperties(props) {
		return this.call('get_properties', [{ did: 'MYDID', siid: 2, piid: 1 }])
			.then(result => {
				const mapped = {};
				this._pushProperty(mapped, 'power', result[0].value);
				return mapped;
			});
	}
};
