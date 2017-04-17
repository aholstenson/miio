
const EventEmitter = require('events');

const IDENTITY_MAPPER = v => v;

class SubDevice extends EventEmitter {
	constructor(parent, info) {
		super();

		this.model = info.model;
		this.id = info.id;

		this.capabilities = [];

		this._properties = {};
		this._propertiesToMonitor = [];
		this._propertyDefinitions = {};

		this._parent = parent;

		this.debug = require('debug')(parent.debug.namespace + '.' + info.id);
	}

	hasCapability(name) {
		return this.capabilities.indexOf(name) >= 0;
	}

	destroy() {
	}

	_report(info) {
		this._propertiesToMonitor.forEach(key => {
			const def = this._propertyDefinitions[key];
			let name = key;
			let value = info.data[key];
			if(def) {
				name = def.name || key;
				value = def.mapper(value);
			}

			const oldValue = this._properties[name];
			this._properties[name] = value;
			if(oldValue !== value) {
				this.debug('Property', key, 'changed from', oldValue, 'to', value);
				this.emit('propertyChanged', {
					property: name,
					oldValue: oldValue,
					value: value
				});
			}
		});
	}

	property(key) {
		return this._properties[key];
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
			}
		}

		if(! def.mapper) {
			def.mapper = IDENTITY_MAPPER;
		}

		this._propertyDefinitions[name] = def;
	}

	setProperty(key, value) {
		const oldValue = this._properties[key];

		if(oldValue !== value) {
			this._properties[key] = value;
			this.debug('Property', key, 'changed from', oldValue, 'to', value);
			this.emit('propertyChanged', {
				property: key,
				oldValue: oldValue,
				value: value
			});
		}
	}

	getProperties(props) {
		const result = {};
		props.forEach(key => {
			result[key] = this._properties[key];
		});
		return result;
	}

	/**
	 * Stub for loadProperties to match full device.
	 */
	loadProperties(props) {
		return Promise.resolve(this.getProperties(props));
	}

	/**
	 * Call a method for this sub device.
	 */
	call(method, args, options) {
		if(! options) {
			options = {};
		}

		options.sid = this.id;
		return this._parent.call(method, args, options);
	}
}

module.exports = SubDevice;
