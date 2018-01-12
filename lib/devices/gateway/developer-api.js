'use strict';

const EventEmitter = require('events');
const dgram = require('dgram');

const MULTICAST_ADDRESS = '224.0.0.50';
const MULTICAST_PORT = 4321;

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

		// Bind a custom function instead of using directly to skip resolving debug before id is set
		this.debug = function() { parent.debug.apply(parent, arguments); };

		this.socket = dgram.createSocket({
			type: 'udp4',
			reuseAddr: true
		});

		this.socket.on('message', this._onMessage.bind(this));
		this.socket.on('listening', () => {
			this.socket.addMembership(MULTICAST_ADDRESS);

			this.emit('ready');
		});
		this.socket.bind({
			port: 9898,
			exclusive: true
		});

		this.devices = [];
		this.ready = false;
	}

	destroy() {
		this.socket.destroy();
	}

	send(data) {
		const json = JSON.stringify(data);
		this.debug('DEV ->', json);
		this.socket.send(json, 0, json.length, this.port || MULTICAST_PORT, this.address);
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
			}
		}
	}
};
