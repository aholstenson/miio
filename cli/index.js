#!/usr/bin/env node
'use strict';

const path = require('path');
require('yargs')
	.commandDir(path.join(__dirname, 'commands'))
	.recommendCommands()
	.demandCommand()
	.argv;
