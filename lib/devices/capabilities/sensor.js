'use strict';

const { Thing } = require('abstract-things');
const {
	Temperature,
	RelativeHumidity,
	PM2_5,
	Illuminance,
	AtmosphericPressure,
	PowerLoad,
	PowerConsumed
} = require('abstract-things/sensors');

function bind(Type, updateName, property) {
	return Thing.mixin(Parent => class extends Parent.with(Type) {
		propertyUpdated(key, value) {
			if(key === property) {
				this[updateName](value);
			}

			super.propertyUpdated(key, value);
		}
	});
}

module.exports.Temperature = bind(Temperature, 'updateTemperature', 'temperature');
module.exports.Humidity = bind(RelativeHumidity, 'updateRelativeHumidity', 'humidity');
module.exports.Illuminance = bind(Illuminance, 'updateIlluminance', 'illuminance');
module.exports.AQI = bind(PM2_5, 'updatePM2_5', 'aqi');
module.exports.AtmosphericPressure = bind(AtmosphericPressure, 'updateAtmosphericPressure', 'atmosphericPressure');
module.exports.PowerLoad = bind(PowerLoad, 'updatePowerLoad', 'powerLoad');
module.exports.PowerConsumed = bind(PowerConsumed, 'updatePowerConsumed', 'poweConsumed');

/**
 * Setup sensor support for a device.
 */
function mixin(device, options) {
	if(device.capabilities.indexOf('sensor') < 0) {
		device.capabilities.push('sensor');
	}

	device.capabilities.push(options.name);
	Object.defineProperty(device, options.name, {
		get: function() {
			return this.property(options.name);
		}
	});
}

module.exports.extend = mixin;
