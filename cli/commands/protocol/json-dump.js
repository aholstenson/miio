'use strict';

const fs = require('fs');
const chalk = require('chalk');
const log = require('../../log');
const Packet = require('../../../lib/packet');

exports.command = 'json-dump <file>';
exports.description = 'Extract packets from a Wireshark JSON dump';
exports.builder = {
	token: {
		required: true,
		description: 'Token to use for decoding'
	}
};

exports.handler = function(argv) {
	const data = fs.readFileSync(argv.file);
	const packets = JSON.parse(data.toString());

	const packet = new Packet();
	packet.token = Buffer.from(argv.token, 'hex');

	packets.forEach(p => {
		const source = p._source;
		if(! source) return;

		const layers = source.layers;

		const udp = layers.udp;
		if(! udp) return;

		let out;
		if(udp['udp.dstport'] === '54321') {
			// Packet that is being sent to the device
			out = true;
		} else if(udp['udp.srcport'] === '54321') {
			// Packet coming from the device
			out = false;
		} else {
			// Unknown, skip it
			return;
		}


		const rawString = layers.data['data.data'];
		const raw = Buffer.from(rawString.replace(/:/g, ''), 'hex');
		packet.raw = raw;

		log.plain(out ? chalk.bgBlue.white.bold(' -> ') : chalk.bgMagenta.white.bold(' <- '), chalk.yellow(layers.ip['ip.src']), chalk.dim('data='), packet.data ? packet.data.toString() : chalk.dim('N/A'));
	});
};
