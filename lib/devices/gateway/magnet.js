'use strict';


const SubDevice = require('./subdevice');
const { Contact } = require('abstract-things/sensors');

/**
 * Magnet device, emits events `open` and `close` if the state changes.
 */
module.exports = class Magnet extends SubDevice.with(Contact) {
	constructor(parent, info) {
		super(parent, info);

		this.type = 'magnet';
		this.model = 'lumi.magnet';
	}

	_report(data) {
		super._report(data);

		// Protect against reports without status
		if(typeof data['status'] === 'undefined') return;

		// Change the contact state
		const isOpen = data['status'] === 'open';
		this.updateContact(isOpen);
	}
};
