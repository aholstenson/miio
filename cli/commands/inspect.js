'use strict';

const chalk = require('chalk');
const log = require('../log');
const deviceFinder = require('../device-finder');

const GROUPS = [
	{ name: 'Power', tags: [ 'cap:power', 'cap:switchable-power' ] },
	{ name: 'Mode', tags: [ 'cap:mode', 'cap:switchable-mode' ] },
	{ name: 'Sensor', tags: [
		'type:sensor',
		'cap:temperature',
		'cap:relativeHumidity',
		'cap:pressure',
		'cap:pm2.5',
		'cap:illuminance',
		'cap:contact',
		'cap:motion',
	] },
	{ name: 'Brightness', tags: [ 'cap:brightness', 'cap:dimmable' ] },
	{ name: 'Color', tags: [ 'cap:colorable' ] },
	{ name: 'LED', tags: [ 'cap:miio:switchable-led', 'cap:miio:led-brightness' ] },
	{ name: 'Buzzer', tags: [ 'cap:miio:buzzer' ] },
	{ name: 'Children', tags: [ 'cap:children' ] },
	{ name: 'miIO', tags: [ 'type:miio' ]}
];

exports.command = 'inspect <idOrIp>';
exports.description = 'Inspect a device';
exports.builder = {
};

exports.handler = function(argv) {
	let target = argv.idOrIp;
	log.info('Attempting to inspect', target);

	let foundDevice = false;
	let pending = 0;
	const browser = deviceFinder({
		instances: true,
		filter: target
	});
	browser.on('available', device => {
		pending++;

		// TODO: Error handling
		const mgmt = device.management;
		mgmt.info()
			.then(info => {
				log.plain();
				log.device(device, true);

				if(! mgmt.parent) {
					log.plain(chalk.bold('Firmware version:'), info.fw_ver);
					log.plain(chalk.bold('Hardware version:'), info.hw_ver);
					if(info.mcu_fw_ver) {
						log.plain(chalk.bold('MCU firmware version:'), info.mcu_fw_ver);
					}
					log.plain();

					if(info.ap) {
						log.plain(chalk.bold('WiFi:'), info.ap.ssid, chalk.dim('(' + info.ap.bssid + ')'), chalk.bold('RSSI:'), info.ap.rssi);
					} else {
						log.plain(chalk.bold('WiFi:'), 'Not Connected');
					}
					if(info.wifi_fw_ver) {
						log.plain(chalk.bold('WiFi firmware version:'), info.wifi_fw_ver);
					}
					log.plain();

					if(info.ot) {
						let type;
						switch(info.ot) {
							case 'otu':
								type = 'UDP';
								break;
							case 'ott':
								type = 'TCP';
								break;
							default:
								type = 'Unknown (' + info.ot + ')';
						}
						log.plain(chalk.bold('Remote access (Mi Home App):'), type);
					} else {
						log.plain(chalk.bold('Remote access (Mi Home App):'), 'Maybe');
					}
					log.plain();
				}

				const props = device.properties;
				const keys = Object.keys(props);
				if(keys.length > 0) {
					log.plain(chalk.bold('Properties:'));
					for(const key of keys) {
						log.plain('  -', key + ':', props[key]);
					}
					log.plain();
				}

				if(mgmt.parent) {
					log.plain(chalk.bold('Parent:'));
					log.group(() => {
						log.device(mgmt.parent);
					});
				}

				log.plain(chalk.bold('Actions:'));
				log.group(() => {
					const actions = device.metadata.actions;
					const handled = new Set();
					for(const group of GROUPS) {
						let seenTags = new Set();
						let actionsToPrint = [];

						/*
						 * Go through all actions and collect those that
						 * belong to this group.
						 */
						for(const name of Object.keys(actions)) {
							if(handled.has(name)) continue;
							const action = actions[name];

							for(const t of group.tags) {
								if(action.tags.indexOf(t) >= 0) {
									seenTags.add(t);
									actionsToPrint.push(action);
									break;
								}
							}
						}

						if(actionsToPrint.length > 0) {
							log.plain(chalk.bold(group.name), '-', Array.from(seenTags).join(', '));

							for(const action of actionsToPrint) {
								printAction(action);
								handled.add(action.name);
							}

							log.plain();
						}
					}

					let isFirst = true;
					for(const name of Object.keys(actions)) {
						if(handled.has(name)) continue;

						if(isFirst) {
							log.plain(chalk.bold('Other actions'));
							isFirst = false;
						}

						printAction(actions[name]);
					}
				});
			})
			.catch(err => {
				log.error('Could inspect device. Error was:', err.message);
			})
			.then(() => {
				pending--;
				process.exit(0); // eslint-disable-line
			});
	});

	const doneHandler = () => {
		if(pending === 0) {
			if(! foundDevice) {
				log.warn('Could not find device');
			}
			process.exit(0); // eslint-disable-line
		}
	};
	setTimeout(doneHandler, 5000);
	browser.on('done', doneHandler);
};

function printAction(action) {
	log.group(() => {
		let args = action.name;
		for(const arg of action.arguments) {
			args += ' ';

			if(arg.optional) {
				args += '[';
			}

			args += arg.type;

			if(arg.optional) {
				args += ']';
			}
		}

		log.plain(args);
	});
}
