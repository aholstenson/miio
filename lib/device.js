'use strict';

const util = require('util');
const isDeepEqual = require('deep-equal');
const { Thing, Polling } = require('abstract-things');

const DeviceManagement = require('./management');

const IDENTITY_MAPPER  = v => v;

module.exports = Thing.type(Parent => class extends Parent.with(Polling) {
	static get type() {
		return 'miio';
	}

	static availableAPI(builder) {
		builder.action('miioModel')
			.description('Get the model identifier of this device')
			.returns('string')
			.done();

		builder.action('miioProperties')
			.description('Get properties of this device')
			.returns('string')
			.done();

		builder.action('miioCall')
			.description('Execute a raw miio-command to the device')
			.argument('string', false, 'The command to run')
			.argument('array', true, 'Arguments of the command')
			.done();
	}

	constructor(handle) {
		super();

		this.handle = handle;
		this.id = 'miio:' + handle.api.id;
		this.miioModel = handle.api.model;

		this._properties = {};
		this._propertiesToMonitor = [];
		this._propertyDefinitions = {};
		this._reversePropertyDefinitions = {};

		this.poll = this.poll.bind(this);
		// Set up polling to destroy device if unreachable for 5 minutes
		this.updateMaxPollFailures(10);

		this.management = new DeviceManagement(this);
	}

	/**
	 * Public API: Call a miio method.
	 *
	 * @param {*} method
	 * @param {*} args
	 */
	miioCall(method, args) {
		return this.call(method, args);
	}

	/**
	 * Call a raw method on the device.
	 *
	 * @param {*} method
	 * @param {*} args
	 * @param {*} options
	 */
	call(method, args, options) {
		return this.handle.api.call(method, args, options)
			.then(res => {
				if(options && options.refresh) {
					// Special case for loading properties after setting values
					// - delay a bit to make sure the device has time to respond
					return new Promise(resolve => setTimeout(() => {
						const properties = Array.isArray(options.refresh) ? options.refresh : this._propertiesToMonitor;

						this._loadProperties(properties)
							.then(() => resolve(res))
							.catch(() => resolve(res));

					}, (options && options.refreshDelay) || 50));
				} else {
					return res;
				}
			});
	}

	/**
	 * Define a property and how the value should be mapped. All defined
	 * properties are monitored if #monitor() is called.
	 */
	defineProperty(name, def) {
		this._propertiesToMonitor.push(name);

		if(typeof def === 'function') {
			def = {
				mapper: def
			};
		} else if(typeof def === 'undefined') {
			def = {
				mapper: IDENTITY_MAPPER
			};
		}

		if(! def.mapper) {
			def.mapper = IDENTITY_MAPPER;
		}

		if(def.name) {
			this._reversePropertyDefinitions[def.name] = name;
		}
		this._propertyDefinitions[name] = def;
	}

	/**
	 * Map and add a property to an object.
	 *
	 * @param {object} result
	 * @param {string} name
	 * @param {*} value
	 */
	_pushProperty(result, name, value) {
		const def = this._propertyDefinitions[name];
		if(! def) {
			result[name] = value;
		} else if(def.handler) {
			def.handler(result, value);
		} else {
			result[def.name || name] = def.mapper(value);
		}
	}

	poll(isInitial) {
		// Polling involves simply calling load properties
		return this._loadProperties();
	}

	_loadProperties(properties) {
		if(typeof properties === 'undefined') {
			properties = this._propertiesToMonitor;
		}

		if(properties.length === 0) return Promise.resolve();

		return this.loadProperties(properties)
			.then(values => {
				Object.keys(values).forEach(key => {
					this.setProperty(key, values[key]);
				});
			});
	}

	setProperty(key, value) {
		const oldValue = this._properties[key];

		if(! isDeepEqual(oldValue, value)) {
			this._properties[key] = value;
			this.debug('Property', key, 'changed from', oldValue, 'to', value);

			this.propertyUpdated(key, value, oldValue);
		}
	}

	propertyUpdated(key, value, oldValue) {
	}

	setRawProperty(name, value) {
		const def = this._propertyDefinitions[name];
		if(! def) return;

		if(def.handler) {
			const result = {};
			def.handler(result, value);
			Object.keys(result).forEach(key => {
				this.setProperty(key, result[key]);
			});
		} else {
			this.setProperty(def.name || name, def.mapper(value));
		}
	}

	property(key) {
		return this._properties[key];
	}

	get properties() {
		return Object.assign({}, this._properties);
	}

	/**
	 * Public API to get properties defined by the device.
	 */
	miioProperties() {
		return this.properties;
	}

	/**
	 * Get several properties at once.
	 *
	 * @param {array} props
	 */
	getProperties(props) {
		const result = {};
		props.forEach(key => {
			result[key] = this._properties[key];
		});
		return result;
	}

	/**
	 * Load properties from the device.
	 *
	 * @param {*} props
	 */
	loadProperties(props) {
		// Rewrite property names to device internal ones
		props = props.map(key => this._reversePropertyDefinitions[key] || key);

		// Call get_prop to map everything
		return this.call('get_prop', props)
			.then(result => {
				const obj = {};
				for(let i=0; i<result.length; i++) {
					this._pushProperty(obj, props[i], result[i]);
				}
				return obj;
			});
	}

	/**
	 * Callback for performing destroy tasks for this device.
	 */
	destroyCallback() {
		return super.destroyCallback()
			.then(() => {
				// Release the reference to the network
				this.handle.ref.release();
			});
	}

	[util.inspect.custom](depth, options) {
		if(depth === 0) {
			return options.stylize('MiioDevice', 'special')
				+ '[' + this.miioModel + ']';
		}

		return options.stylize('MiioDevice', 'special')
			+ ' {\n'
			+ '  model=' + this.miioModel + ',\n'
			+ '  types=' + Array.from(this.metadata.types).join(', ') + ',\n'
			+ '  capabilities=' + Array.from(this.metadata.capabilities).join(', ')
			+ '\n}';
	}

	/**
	 * Check that the current result is equal to the string `ok`.
	 */
	static checkOk(result) {
		if(! result || (typeof result === 'string' && result.toLowerCase() !== 'ok')) {
			throw new Error('Could not perform operation');
		}

		return null;
	}
});
