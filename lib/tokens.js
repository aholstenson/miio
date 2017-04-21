'use strict';

const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');
const AppDirectory = require('appdirectory');
const dirs = new AppDirectory('miio');

const CHECK_TIME = 1000;
const MAX_STALE_TIME = 120000;

const debug = require('debug')('miio.tokens');

/**
 * Shared storage for tokens of devices. Keeps a simple JSON file synced
 * with tokens connected to device ids.
 */
class Tokens {
	constructor() {
		this._file = path.join(dirs.userData(), 'tokens.json');
		this._data = {};
		this._lastSync = 0;
	}

	get(deviceId) {
		const now = Date.now();
		const diff = now - this._lastSync;

		if(diff > CHECK_TIME) {
			return this._loadAndGet(deviceId);
		}

		return Promise.resolve(this._get(deviceId));
	}

	_get(deviceId) {
		return this._data[deviceId];
	}

	_loadAndGet(deviceId) {
		return this._load()
			.then(() => this._get(deviceId))
			.catch(() => null);
	}

	_load() {
		if(this._loading) return this._loading;

		return this._loading = new Promise((resolve, reject) => {
			debug('Loading token storage');
			fs.stat(this._file, (err, stat) => {
				if(err) {
					delete this._loading;
					if(err.code === 'ENOENT') {
						debug('Token storage does not exist');
						this._lastSync = Date.now();
						resolve(this._data);
					} else {
						reject(err);
					}

					return;
				}

				if(! stat.isFile()) {
					// tokens.json does not exist
					delete this._loading;
					reject(new Error('tokens.json exists but is not a file'));
				} else if(Date.now() - this._lastSync > MAX_STALE_TIME || stat.mtime.getTime() > this._lastSync) {
					debug('Loading tokens');
					fs.readFile(this._file, (err, result) =>  {
						this._data = JSON.parse(result.toString());
						this._lastSync = Date.now();
						delete this._loading;
						resolve(this._data);
					});
				} else {
					delete this._loading;
					this._lastSync = Date.now();
					resolve(this._data);
				}
			})
		});
	}

	update(deviceId, token) {
		return this._load()
			.then(() => {
				this._data[deviceId] = token;

				if(this._saving) {
					this._dirty = true;
					return this._saving;
				}

				return this._saving = new Promise((resolve, reject) => {
					const save = () => {
						debug('About to save tokens');
						fs.writeFile(this._file, JSON.stringify(this._data, true), (err) => {
							if(err) {
								reject(err);
							} else {
								if(this._dirty) {
									debug('Redoing save due to multiple updates');
									this._dirty = false;
									save();
								} else {
									delete this._saving;
									resolve();
								}
							}
						});
					};

					mkdirp(dirs.userData(), (err) => {
						if(err) {
							reject(err);
							return;
						}

						save();
					});
				});
			});
	}
}

module.exports = Tokens;
