#!/usr/bin/env node
/* eslint-disable */
const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');

const Packet = require('../lib/packet');
const Device = require('../lib/device');
const Browser = require('../lib/discovery');
const Tokens = require('../lib/tokens');

const tokens = new Tokens();

if(args.discover) {
	console.log('Discovering devices. Press Ctrl+C to stop.')
	console.log();
	const browser = new Browser({
		cacheTime: 60,
		useTokenStorage: false
	});
	browser.on('available', reg => {
		const supported = reg.model && reg.type;
		console.log('Device ID:', reg.id);
		console.log('Model ID:', reg.model || 'Unknown');
		console.log('Type:', reg.type);
		console.log('Address:', reg.address + (reg.hostname ? ' (' + reg.hostname + ')' : ''));
		console.log('Token:', reg.token);
		console.log('Support:', reg.model ? (supported ? 'At least basic' : 'Generic') : 'Unknown');
		console.log();

		if(args.sync && reg.token) {
			tokens.update(reg.id, reg.token)
				.catch(err => {
					console.error('Could not update tokens', err);
				});
		}
	});
} else if(args.configure) {
	const ssid = args.ssid;
	const passwd = args.passwd;

	if(typeof ssid === 'undefined') {
		console.error('--ssid must be used and set to name of the wireless network the device should connect to');
		process.exit(1);
	}
	if(typeof passwd === 'undefined') {
		console.error('--passwd must be used and set to password of the wireless network');
		process.exit(1);
	}

	let target = null;
	if(typeof args.configure !== 'boolean') {
		// We want a specific address or id
		target = String(args.configure);
		console.log('Attempting to configure', target);
	} else {
		console.log('Configuring all devices');
	}
	console.log();

	let hasConfigured = false;
	let pending = 0;
	const browser = new Browser({
		cacheTime: 20,
		useTokenStorage: false
	});
	browser.on('available', reg => {
		if(target) {
			// There is a target so apply filter to make sure we match
			if(reg.id !== target && reg.address !== target) return;
		}

		if(typeof args.token === 'string') {
			reg.token = args.token;
		}
		else if(! reg.token) {
			console.log(reg.id, 'at', reg.address, 'does not support auto-tokens, skipping configuration');
		}

		pending++;
		const device = new Device(reg);
		device.init()
			.then(() => {
				return device.management.info();
			})
			.then(info => {
				if(info.ap && info.ap.ssid === String(ssid)) {
					console.log(reg.id, 'at', reg.address, 'is already configured to use this network');
					hasConfigured = true;
					return;
				}

				return device.management.updateWireless({
					ssid: String(ssid),
					passwd: String(passwd)
				}).then(r => {
					hasConfigured = true;
					console.log(reg.id, 'at', reg.address, 'now uses', ssid, 'as its network');
					console.log('  Token:', reg.token);
					console.log();
					return tokens.update(reg.id, reg.token);
				})
			})
			.catch(err => {
				console.error(reg.id, 'at', reg.address, 'encountered an error while configuring:', err.message);
				console.error();
			})
			.then(() => {
				pending--;
			})
	});

	setTimeout(() => {
		if(pending == 0) {
			if(! hasConfigured) {
				console.log('No devices were configured');
			} else {
				console.log('Done');
			}
			process.exit(0);
		}
	}, 5000);

	setTimeout(() => {
		if(! hasConfigured) {
			console.log('No devices were configured');
		} else {
			console.log('Done');
		}
		process.exit(0);
	}, 60000);
} else if(args.update) {
	let target = null;
	if(typeof args.update !== 'boolean') {
		// We want a specific address or id
		target = String(args.update);
		console.log('Attempting to update', target);
	} else {
		console.error('Need to specify id or address to device');
		process.exit(1);
	}

	if(! args.token) {
		console.error('Token is required when updating a device');
		process.exit(1);
	}

	let hasConfigured = false;
	let pending = 0;
	const browser = new Browser({
		cacheTime: 20,
		useTokenStorage: false
	});
	browser.on('available', reg => {
		if(target) {
			// There is a target so apply filter to make sure we match
			if(reg.id !== target && reg.address !== target) return;
		}

		pending++;
		tokens.update(reg.id, args.token)
			.then(() => {
				console.log('Device updated');
			})
			.catch(err => {
				console.error('Could not update device:', err.message);
			})
			.then(() => {
				pending--;
				hasConfigured = true;
				process.exit(0);
			});
	});

	setTimeout(() => {
		if(pending == 0) {
			if(! hasConfigured) {
				console.log('Could not find device');
			} else {
				console.log('Done');
			}
			process.exit(0);
		}
	}, 5000);
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
