'use strict';

const path = require('path');

exports.command = 'protocol <command>';
exports.description = 'Inspect and test raw miIO-commands';
exports.builder = yargs => yargs.commandDir(path.join(__dirname, 'protocol'));
exports.handler = () => {};
