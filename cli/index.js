#!/usr/bin/env node
/* eslint-disable */
const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');

const Packet = require('../lib/packet');
const Device = require('../lib/device');
const Browser = require('../lib/discovery');

if(args.discover) {
	if(typeof args.discover === 'string') {
		// Fetch the token of a device via hostname/IP
		const device = new Device({
			address: args.discover
		});

		device.discover()
		.then(data => {
			const token = data.token.toString('hex');
			if(token.match(/^[fF]+$/)) {
				console.log('This device does not support automatic token extraction');
			} else {
				console.log('Token is', token);
			}
			device.destroy();
		})
		.catch(err => {
			console.error('Could not fetch the token', err);
			device.destroy();
		});
	} else {
		console.log('Discovering devices. Press Ctrl+C to stop.')
		console.log();
		const browser = new Browser(60);
		browser.on('available', reg => {
			console.log('Device ID:', reg.id);
			console.log('Model:', reg.model || 'Unknown');
			console.log('Address:', reg.address + (reg.hostname ? ' (' + reg.hostname + ')' : ''));
			console.log('Token:', reg.token);
			console.log();
		});
	}
} else if(args.packet) {
	if(! args.token) {
		console.error('Token is required to extract packet contents');
		process.exit(1);
	}

	const packet = new Packet();
	packet.token = Buffer.from(args.token, 'hex');

	if(typeof args.packet !== 'string') {
		console.error('--packet needs the packet data to do anything useful');
		process.exit(1);
	}
	const raw = Buffer.from(args.packet, 'hex');
	packet.raw = raw;

	const data = packet.data;
	if(! data) {
		console.error('Could not extract data from packet, check your token and packet data');
	} else {
		console.log('Hex: ', data.toString('hex'));
		console.log('String: ', data.toString());
	}
} else if(args['json-dump']) {
	if(! args.token) {
		console.error('Token is required to extract packets from JSON dump');
		process.exit(1);
	}

	const data = fs.readFileSync(args['json-dump']);
	const packets = JSON.parse(data.toString());

	const packet = new Packet();
	packet.token = Buffer.from(args.token, 'hex');

	packets.forEach(p => {
		const source = p._source;
		if(! source) return;

		const layers = source.layers;

		const udp = layers.udp;
		if(! udp) return;

		let out;
		if(udp['udp.dstport'] == '54321') {
			// Packet that is being sent to the device
			out = true;
		} else if(udp['udp.srcport'] == '54321') {
			// Packet coming from the device
			out = false;
		} else {
			// Unknown, skip it
			return;
		}


		const rawString = layers.data['data.data'];
		const raw = Buffer.from(rawString.replace(/:/g, ''), 'hex');
		packet.raw = raw;

		console.log(out ? '->' : '<-', layers.ip['ip.src'], ' data=', packet.data ? packet.data.toString() : 'N/A');
	});
} else {
	console.error('Unsupported mode');
	process.exit(1);
}
