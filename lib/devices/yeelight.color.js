'use strict';

const Yeelight = require('./yeelight');

class YeelightColor extends Yeelight {
	constructor(options) {
		super(options);

		this.defineProperty('rgb', {
			mapper: rgb => {
				if(! rgb || rgb.length) return null;

				return {
					red: parseInt(rgb.substring(0, 2), 16),
					green: parseInt(rgb.substring(2, 4), 16),
					blue: parseInt(rgb.substring(4, 6), 16)
				};
			}
		});

		this.capabilities.push('color:rgb');
	}

	get rgb() {
		return this.property('rgb');
	}

	setRGB(color, options) {
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

		const rgb = color.red * 65536 + color.green * 256 + color.blue;
		return this.call('set_rgb', Yeelight.withEffect(rgb, options))
			.then(Yeelight.checkOk);
	}
}

module.exports = YeelightColor;
