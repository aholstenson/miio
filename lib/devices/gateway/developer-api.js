'use strict';

const EventEmitter = require('events');
const dgram = require('dgram');
const os = require('os');

const MULTICAST_ADDRESS = '224.0.0.50';
const MULTICAST_PORT = 4321;

const SERVER_PORT = 9898;

/**
 * Local Developer API for the gateway. Used to read data from the gateway
 * and connected devices.
 *
 * TODO: Retries for discovery
 */
module.exports = class DeveloperApi extends EventEmitter {
	constructor(parent, address) {
		super();

		this.address = address;
		this.port = SERVER_PORT;

		// Bind a custom function instead of using directly to skip resolving debug before id is set
		this.debug = function() { parent.debug.apply(parent, arguments); };

		this.socket = dgram.createSocket({
			type: 'udp4',
			reuseAddr: true
		});

		this.socket.on('message', this._onMessage.bind(this));
		this.socket.on('listening', () => {
			// Add membership to the multicast addresss for all network interfaces
			const interfaces = os.networkInterfaces();
			for(const name of Object.keys(interfaces)) {
				const addresses = interfaces[name];

				for(const addr of addresses) {
					if(addr.family === 'IPv4') {
						this.socket.addMembership(MULTICAST_ADDRESS, addr.address);
					}
				}
			}

			// Broadcast a whois to find all gateways
			const json = JSON.stringify({
				cmd: 'whois'
			});
			this.debug('DEV BROADCAST ->', json);
			this.socket.send(json, 0, json.length, MULTICAST_PORT, MULTICAST_ADDRESS);

			// Give us one second to discover the gateway
			setTimeout(() => {
				this.debug('DEV <- Timeout for whois');
				this.emit('ready');
			}, 1000);
		});
		this.socket.bind({
			port: SERVER_PORT,
			exclusive: true
		});
	}

	destroy() {
		this.socket.close();
	}

	send(data) {
		const json = JSON.stringify(data);
		this.debug('DEV ->', json);

		this.socket.send(json, 0, json.length, this.port, this.address);
	}

	read(sid) {
		this.send({
			cmd: 'read',
			sid: sid
		});
	}

	_onMessage(msg) {
		let data;
		try {
			this.debug('DEV <-', msg.toString());
			data = JSON.parse(msg.toString());
		} catch(ex) {
			this.emit('error', ex);
			return;
		}

		switch(data.cmd) {
			case 'iam':
				if(data.ip === this.address) {
					this.port = data.port;
					this.sid = data.sid;

					this.emit('ready');
				}
				break;
			case 'read_ack':
			case 'heartbeat':
			case 'report': {
				if(! this.sid && data.model === 'gateway') {
					this.sid = data.sid;
				}

				const parsed = JSON.parse(data.data);
				this.emit('propertiesChanged', {
					id: this.sid === data.sid ? '0' : data.sid,
					data: parsed
				});

				this.emit('properties:' + data.sid, parsed);
			}
		}
	}
};
