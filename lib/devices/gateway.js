'use strict';

const EventEmitter = require('events');
const dgram = require('dgram');

const Device = require('../device');
const Sensor = require('./capabilities/sensor');

const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

const SubDevice = require('./gateway/subdevice');

const types = {
	// Switch (button) controller
	1: require('./gateway/switch'),
	// Motion sensor
	2: require('./gateway/motion'),
	// Magnet sensor for doors and windows
	3: require('./gateway/magnet'),

	// TODO: What is 4, 5 and 6? plug, 86sw1 and 86sw2 are left

	// Light switch with two channels
	7: require('./gateway/ctrl_neutral2'),
	// Cube controller
	8: require('./gateway/cube'),
	// Light switch with one channel
	9: require('./gateway/ctrl_neutral1'),
	// Temperature and Humidity sensor
	10: require('./gateway/sensor_ht'),

	11: require('./gateway/plug'),

	// Aqara Temperature/Humidity/Pressure sensor
	19: require('./gateway/weather'),
	// Light switch (live+neutral wire version) with one channel
	20: require('./gateway/ctrl_ln1'),
	// Light switch (live+neutral wire version) with two channels
	21: require('./gateway/ctrl_ln2')
}
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
		types[id] = deviceClass;
	}

	constructor(options) {
		super(options);

		this.type = Gateway.TYPE;

		this._devices = {};

		this.defineProperty('illumination', {
			name: 'illuminance'
		});

		this.defineProperty('rgb', {
			handler: (result, rgba) => {
				result['rgb'] = {
					red: 0xff & (rgba >> 16),
					green: 0xff & (rgba >> 8),
					blue: 0xff & rgba
				};
				result['brightness'] = Math.round(0xff & (rgba >> 24));
			}
		});

		// Monitor every minute right now
		this._monitorInterval = 60 * 1000;
	}

	_report(properties) {
		Object.keys(properties).forEach(key => {
			this.setRawProperty(key, properties[key]);
		});
	}

	init() {
		return super.init()
			.then(() => this._updateDeviceList())
			.then(() => this._findDeveloperKey())
			.then(() => this._mixins())
			.then(() => {
				// Update devices once every half an hour
				this._deviceListTimer = setInterval(this._updateDeviceList.bind(this), 30 * 60 * 1000);
			})
			.then(() => this);
	}

	destroy() {
		super.destroy();

		if(this.net) {
			this.net.destroy();
		}

		clearInterval(this._deviceListTimer);
	}

	_updateDeviceList() {
		function stripLumiFromId(id) {
			if(id.indexOf('lumi.') === 0) {
				return id.substring(5);
			}
			return id;
		}

		return this.call('get_device_prop', [ 'lumi.0', 'device_list' ])
			.then(list => {
				for(let i=0; i<list.length; i+=5) {
					const id = stripLumiFromId(list[i]);
					const type = list[i+1];
					const online = list[i+2] === 1;

					// Sanity check, skip gateway if found
					if(id === '0') continue;

					let reg = this._devices[id];
					if(! reg) {
						this._devices[id] = reg = {
							id: id,
							type: type,
							online: false,
							device: null
						};
					}

					if(online) {
						if(! reg.online) {
							// This device was either just found or it was temporarily unavailable

							const type = types[reg.type] || SubDevice;
							reg.device = new type(this, {
								id: id,
								type: 'lumi.generic.' + type
							});

							// TODO: Load properties
							// device._report(deviceInfo)

							reg.device.init()
								.then(() => this.emit('deviceAvailable', reg.device))
								.catch(err => {
									this.debug('Could not init subdevice', err);
									reg.online = false;
								});
						}
					} else {
						// This device is no longer available
						if(reg.device) {
							const device = device;

							reg.device.destroy();
							reg.device = null;

							this.emit('deviceUnavailable', reg.device);
						}
					}
				}
			});
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
	 * Set the developer key and start listenting for events from the gateway.
	 */
	_setDeveloperKey(key) {
		this._developerKey = key;

		// If we are already connected to the Developer API skip init
		if(this.devApi) return Promise.resolve();

		return new Promise((resolve, reject) => {
			this.devApi = new DeveloperApi(this, this.address);

			this.devApi.on('propertiesChanged', e => {
				if(e.id === '0') {
					// Data for the local gateway
					this._report(e.data);
				} else {
					let reg = this._devices[e.id];
					if(reg && reg.device) {
						reg.device._report(e.data);
					}
				}
			});
			this.devApi.on('ready', resolve);

			setTimeout(reject, 10000);
		});
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


			const a = Math.max(0, Math.min(255, Math.round(this.property('brightness'))));
			const rgb = a << 24 | (color.red << 16) | (color.green << 8) | color.blue;
			return this.call('set_rgb', [ rgb >>> 0 ]);//, { refresh: [ 'rgb' ] });
		};

		Object.defineProperty(this, 'rgb', {
			get: function() { return this.property('rgb') }
		});

		this.capabilities.push('brightness');
		this.setBrightness = function(brightness) {
			const a = Math.max(0, Math.min(255, Math.round(brightness)));
			const color = this.property('rgb');
			const rgb = a << 24 | (color.red << 16) | (color.green << 8) | color.blue;
			return this.call('set_rgb', [ rgb >>> 0 ]);//, { refresh: [ 'rgb' ] });
		};

		Object.defineProperty(this, 'brightness', {
			get: function() { return this.property('brightness') }
		});
	}

	get devices() {
		const result = [];
		Object.keys(this._devices).forEach(key => {
			const reg = this._devices[key];
			if(reg.device) result.push(reg.device);
		});
		return result;
	}

	/**
	 * Start the process of adding a device. Allows Zigbee devices to join for
	 * 30 seconds.
	 */
	addDevice() {
		return this.call('start_zigbee_join', [ 30 ])
			.then(Device.checkOk)
			.then(this._updateDeviceList.bind(this))
			.then(() => undefined);
	}

	/**
	 * Stop allowing devices to join.
	 */
	stopAddDevice() {
		return this.call('start_zigbee_join', [ 0 ])
			.then(Device.checkOk)
			.then(this._updateDeviceList.bind(this))
			.then(() => undefined);
	}

	/**
	 * Remove a device from the gateway using the identifier of the device.
	 */
	removeDevice(id) {
		return this.call('remove_device', [ id ])
			.then(Device.checkOk)
			.then(this._updateDeviceList.bind(this))
			.then(() => undefined);
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

			this.emit('ready');
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
}

module.exports = Gateway;
