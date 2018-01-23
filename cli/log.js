'use strict';

const chalk = require('chalk');

module.exports = {
	indent: '',

	info(...args) {
		console.log(this.indent + chalk.bgWhite.black(' INFO '), args.join(' ')); // eslint-disable-line
	},

	error(...args) {
		console.log(this.indent + chalk.bgRed.white(' ERROR '), args.join(' ')); // eslint-disable-line
	},

	warn(...args) {
		console.log(this.indent + chalk.bgYellow.black(' WARNING '), args.join(' ')); // eslint-disable-line
	},

	plain(...args) {
		console.log(this.indent + args.join(' ')); // eslint-disable-line
	},

	group(g) {
		let indent = this.indent;
		this.indent += '  ';
		try {
			g();
		} finally {
			this.indent = indent;
		}
	},

	device(device, detailed=false) {
		const mgmt = device.management;

		const types = Array.from(device.metadata.types);
		const filteredTypes = types.filter(t => t.indexOf('miio:') === 0);
		const caps = Array.from(device.metadata.capabilities);

		this.plain(chalk.bold('Device ID:'), device.id.replace(/^miio:/, ''));
		this.plain(chalk.bold('Model info:'), mgmt.model || 'Unknown');

		if(mgmt.address) {
			this.plain(chalk.bold('Address:'), mgmt.address);
		} else if(mgmt.parent) {
			this.plain(chalk.bold('Address:'), 'Owned by', mgmt.parent.id);
		}

		if(mgmt.token) {
			this.plain(chalk.bold('Token:'), mgmt.token, mgmt.autoToken ? chalk.green('via auto-token') : chalk.yellow('via stored token'));
		} else if(! mgmt.parent) {
			this.plain(chalk.bold('Token:'), '???');
		} else {
			this.plain(chalk.bold('Token:'), chalk.green('Automatic via parent device'));
		}

		this.plain(chalk.bold('Support:'), mgmt.model ? (filteredTypes.length > 0 ? chalk.green('At least basic') : chalk.yellow('At least generic')) : chalk.yellow('Unknown'));

		if(detailed) {
			this.plain();
			this.plain(chalk.bold('Type info:'), types.join(', '));
			this.plain(chalk.bold('Capabilities:'), caps.join(', '));
		}

		this.plain();
	}
};
