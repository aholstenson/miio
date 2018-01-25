'use strict';


const SubDevice = require('./subdevice');
const { Contact } = require('abstract-things/sensors');
const Voltage = require('./voltage');

/**
 * Magnet device, emits events `open` and `close` if the state changes.
 */
module.exports = class Magnet extends SubDevice.with(Contact, Voltage) {
	constructor(parent, info) {
		super(parent, info);

		this.miioModel = 'lumi.magnet';

		this.defineProperty('status');
	}

	propertyUpdated(key, value, oldValue) {
		if(key === 'status') {
			// Change the contact state
			const isContact = value === 'close';
			this.updateContact(isContact);
		}

		super.propertyUpdated(key, value, oldValue);
	}
};
