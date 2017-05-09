'use strict';

const EventEmitter = require('events');
const dgram = require('dgram');

const Device = require('../device');
const Sensor = require('./capabilities/sensor');

const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

const SubDevice = require('./gateway/subdevice');
const devices = {
	// Temperature and Humidity sensor
	'sensor_ht': require('./gateway/sensor_ht'),

	// Switch (button)
	'switch': require('./gateway/switch'),
	// Cube controller
	'cube': require('./gateway/cube'),
	// Light Switches (1 and 2 buttons)
	'86sw1': require('./gateway/86sw1'),
	'86sw2': require('./gateway/86sw2'),

	// Motion sensor
	'motion': require('./gateway/motion'),
	// Magnet sensor for windows and doors
	'magnet': require('./gateway/magnet'),

	// Simple plug for sockets
	'plug': require('./gateway/plug'),

	// Plugs for light switches
	'ctrl_neutral1': require('./gateway/ctrl_neutral1'),
	'ctrl_neutral2': require('./gateway/ctrl_neutral2')
};

/**
 * Generate a key for use with the local developer API. This does not generate
 * a secure key, but the Mi Home app does not seem to do that either.
 */
function generateKey() {
	let result = '';
	for(let i=0; i<16; i++) {
		let idx = Math.floor(Math.random() * CHARS.length)
		result += CHARS[idx];
	}
	return result;
}

/**
 * Abstraction over a Mi Smart Home Gateway.
 *
 * This device is very different from most other miIO-devices in that it has
 * devices on its own. There seems to be a way to talk to these devices by
 * setting `sid` in the requests, which means we can poll them. The problem
 * is that certain devices also send events, but these seem to only be
 * accessible over a local developer connection.
 *
 * So to work around this we activate the local developer connection and use
 * that together with the regular calls for changing things on the gateway.
 */
class Gateway extends Device {
	static get TYPE() { return 'gateway' }

	static get SubDevice() { return SubDevice }

	static registerSubDevice(id, deviceClass) {
		devices[id] = deviceClass;
	}

	constructor(options) {
		super(options);

		this.type = Gateway.TYPE;

		this._devices = {};
	}

	_report(properties) {
		Object.keys(properties).forEach(key => {
			switch(key) {
				case 'illumination':
					// TODO: What scale does this actually have? Lux?
					this.setProperty('illuminance', properties[key]);
					break;
				case 'rgb':
				{
					const rgba = properties[key];

					this.setProperty('rgb',  {
						red: 0xff & (rgba >> 16),
						green: 0xff & (rgba >> 8),
						blue: 0xff & rgba
					});
					this.setProperty('brightness', Math.round((0xff & (rgba >> 24)) / 255 * 100));
					break;
				}
			}
		});
	}

	_setDeveloperKey(key) {
		this._developerKey = key;

		// If we are already connected to the Developer API skip init
		if(this.devApi) return Promise.resolve();

		return new Promise((resolve, reject) => {
			this.devApi = new DeveloperApi(this, this.address);

			this.devApi.on('deviceAvailable', deviceInfo => {
				const currentDevice = this._devices[deviceInfo.id];
				if(currentDevice) {
					currentDevice.destroy();
					this.emit('deviceUnavailable', currentDevice);
				}

				const type = devices[deviceInfo.model] || SubDevice;
				const device = this._devices[deviceInfo.id] = new type(this, deviceInfo);
				device._report(deviceInfo);
				this.emit('deviceAvailable', device);
			});
			this.devApi.on('deviceUpdated', deviceInfo => {
				const currentDevice = this._devices[deviceInfo.id];
				if(! currentDevice) return;

				currentDevice._report(deviceInfo);
			});
			this.devApi.on('properties', this._report.bind(this));
			this.devApi.on('ready', resolve);

			setTimeout(reject, 10000);

			// TODO: Device removal
		});
	}

	init() {
		return super.init()
			.then(() => this._findDeveloperKey())
			.then(() => this._mixins())
			.then(() => this);
	}

	_mixins() {
		if(this.property('rgb')) {
			this._mixinLight()
		}

		const illuminance = this.property('illuminance');
		if(typeof illuminance !== 'undefined' && illuminance !== null) {
			Sensor.extend(this, { name: 'illuminance' });
		}
	}

	_mixinLight() {
		this.capabilities.push('color:rgb');
		this.setRGB = function(color) {
			if(typeof color === 'string') {
				const parsed = /#?(([0-9a-f]{6})|([0-9a-f]{3}))/i.exec(color);
				if(! parsed) {
					throw new Error('Invalid hex color: ' + color);
				}

				const rgb = parsed[1];
				if(rgb.length == 3) {
					color = {
						red: parseInt(rgb[0] + rgb[0], 16),
						green: parseInt(rgb[1] + rgb[1], 16),
						blue: parseInt(rgb[2] + rgb[2], 16),
					};
				} else {
					color = {
						red: parseInt(rgb.substring(0, 2), 16),
						green: parseInt(rgb.substring(2, 4), 16),
						blue: parseInt(rgb.substring(4, 6), 16)
					};
				}
			}


			const a = Math.max(0, Math.min(255, Math.round(this.property('brightness') / 100 * 255)));
			const rgb = a << 24 | (color.red << 16) | (color.green << 8) | color.blue;
			return this.call('set_rgb', [ rgb ]);//, { refresh: [ 'rgb' ] });
		};

		Object.defineProperty(this, 'rgb', {
			get: function() { return this.property('rgb') }
		});

		this.capabilities.push('brightness');
		this.setBrightness = function(brightness) {
			const a = Math.max(0, Math.min(255, Math.round(brightness / 100 * 255)));
			const color = this.property('rgb');
			const rgb = a << 24 | (color.red << 16) | (color.green << 8) | color.blue;
			return this.call('set_rgb', [ rgb>>>0 ]);//, { refresh: [ 'rgb' ] });
		};

		Object.defineProperty(this, 'brightness', {
			get: function() { return this.property('brightness') }
		});
	}

	get devices() {
		const result = [];
		Object.keys(this._devices).forEach(key => result.push(this._devices[key]));
		return result;
	}

	/**
	 * Either resolve the developer key or setup a new one.
	 */
	_findDeveloperKey() {
		// We already have a developer key
		if(this._developerKey) return Promise.resolve(this._developerKey);

		// Call and fetch the key or set a new key
		return this.call('get_lumi_dpf_aes_key')
			.then(result => {
				let key = result[0];
				if(key && key.length === 16) {
					// This is a valid key, store it
					return key;
				}

				key = generateKey();
				return this.call('set_lumi_dpf_aes_key', [ key ]);
			})
			.then(key => this._setDeveloperKey(key));
	}

	/**
	 * Start the process of adding a device. Allows Zigbee devices to join for
	 * 30 seconds.
	 */
	addDevice() {
		return this.call('start_zigbee_join', [ 30 ])
			.then(result => result[0] == 'ok');
	}

	/**
	 * Stop allowing devices to join.
	 */
	stopAddDevice() {
		return this.call('start_zigbee_join', [ 0 ])
			.then(result => result[0] == 'ok');
	}

	/**
	 * Remove a device from the gateway using the identifier of the device.
	 */
	removeDevice(id) {
		return this.call('remove_device', [ id ]);
	}

	destroy() {
		super.destroy();

		if(this.net) {
			this.net.destroy();
		}
	}
}

const MULTICAST_ADDRESS = '224.0.0.50';
const MULTICAST_PORT = 4321;

/**
 * Local Developer API for the gateway. Used to read data from the gateway
 * and connected devices.
 *
 * TODO: Retries for discovery
 */
class DeveloperApi extends EventEmitter {
	constructor(parent, address) {
		super();

		this.address = address;
		this.debug = parent.debug;

		this.socket = dgram.createSocket({
			type: 'udp4',
			reuseAddr: true
		});

		this.socket.on('message', this._onMessage.bind(this));
		this.socket.on('listening', () => {
			this.socket.addMembership(MULTICAST_ADDRESS);

			this.send({
				cmd: 'whois'
			});
		});
		this.socket.bind(9898);

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
			case 'iam':
			// TODO: Do we need to protect against multiple gateways?

				// This is a response to the initial whois
				this.sid = data.sid;
				this.port = data.port;

				// Discover devices
				this.send({
					cmd: 'get_id_list'
				});

				break;
			case 'heartbeat':
				if(data.sid === this.sid) {
					this.token = data.token;
				}
				break;
			case 'get_id_list_ack':
				if(data.sid === this.sid) {
					// Response with all identifiers of the devices
					this.token = data.token;
					const devices = JSON.parse(data.data);

					// Read data for ourself
					this.send({
						cmd: 'read',
						sid: this.sid
					});

					const now = Date.now();
					devices.forEach(id => {
						this.devices[id] = {
							id: id,
							lastSeen: now
						};

						this.send({
							cmd: 'read',
							sid: id
						});
					});
				}
				break;
			case 'read_ack': {
				const device = this.devices[data.sid];
				if(device) {
					device.lastSeen = Date.now();
					device.data = JSON.parse(data.data);

					if(! device.model) {
						// This is the first read
						device.model = data.model;
						this.emit('deviceAvailable', device);
					}
				} else if(data.sid === this.sid) {
					this.emit('properties', JSON.parse(data.data));

					if(! this.ready) {
						// TODO: Wait for reads from all devices
						this.emit('ready');
						this.ready = true;
					}
				}
				break;
			}
			case 'report': {
				const device = this.devices[data.sid];
				if(device) {
					device.lastSeen = Date.now();

					const parsed = JSON.parse(data.data);
					Object.keys(parsed).forEach(key => {
						device.data[key] = parsed[key];
					});

					this.emit('deviceUpdated', device);
				} else if(data.sid === this.sid) {
					this.emit('properties', JSON.parse(data.data));
				}
			}
		}
	}
}

module.exports = Gateway;
