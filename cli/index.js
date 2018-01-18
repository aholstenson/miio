#!/usr/bin/env node

const path = require('path');
const argv = require('yargs')
	.commandDir(path.join(__dirname, 'commands'))
	.recommendCommands()
	.demandCommand()
	.argv;
