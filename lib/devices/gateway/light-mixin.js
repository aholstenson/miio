'use strict';

const { Thing } = require('abstract-things');
const { Light, SwitchablePower, Dimmable, Colorable } = require('abstract-things/lights');
const { color } = require('abstract-things/values');

/**
 * Capability that register the
 */
module.exports = Thing.mixin(Appliance => class extends Appliance {
	initCallback() {
		this.addExtraChild(new GatewayLight(this));

		return super.initCallback();
	}
});

/**
 * Capability that is mixed in if a gateway is also a light.
 */
const GatewayLight = class extends Light.with(SwitchablePower, Dimmable, Colorable) {
	static get types() {
		return [ 'miio:subdevice', 'miio:gateway-light' ];
	}

	constructor(gateway) {
		super();

		this.model = gateway.miioModel + '.light';
		this.internalId = gateway.id.substring(5) + ':light';
		this.id = gateway.id + ':light';
		this.gateway = gateway;

		// Hijack the property updated event to make control easier
		const propertyUpdated = this.gateway.propertyUpdated;
		this.gateway.propertyUpdated = (key, value, oldValue) => {
			propertyUpdated.call(this.gateway, key, value, oldValue);

			this.propertyUpdated(key, value);
		};
	}

	changePower(power) {
		return this.changeBrightness(power ? 50 : 0);
	}

	changeBrightness(brightness, options) {
		const color = this.gateway.property('rgb');
		const rgb = brightness << 24 | (color.red << 16) | (color.green << 8) | color.blue;

		return this.gateway.call('set_rgb', [ rgb >>> 0 ], { refresh: [ 'rgb' ] });
	}

	changeColor(color, options) {
		color = color.rgb;
		const a = this.gateway.property('brightness');
		const rgb = a << 24 | (color.red << 16) | (color.green << 8) | color.blue;

		return this.gateway.call('set_rgb', [ rgb >>> 0 ], { refresh: [ 'rgb' ] });
	}

	propertyUpdated(key, value) {
		if(key === 'rgb') {
			this.updateColor(color.rgb(value.red, value.green, value.blue));
		} else if(key === 'brightness') {
			//this.updateBrightness(Math.round(value / 255 * 100));
			this.updateBrightness(value);
			this.updatePower(value > 0);
		}
	}
};
