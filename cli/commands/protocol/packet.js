'use strict';

const log = require('../../log');
const Packet = require('../../../lib/packet');

exports.command = 'packet <hexData>';
exports.description = 'Decode a miIO UDP packet';
exports.builder = {
	token: {
		required: true,
		description: 'Token to use for decoding'
	}
};

exports.handler = function(argv) {
	const packet = new Packet();
	packet.token = Buffer.from(argv.token, 'hex');

	const raw = Buffer.from(argv.hexData, 'hex');
	packet.raw = raw;

	const data = packet.data;
	if(! data) {
		log.error('Could not extract data from packet, check your token and packet data');
	} else {
		log.plain('Hex: ', data.toString('hex'));
		log.plain('String: ', data.toString());
	}
};
