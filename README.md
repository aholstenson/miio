# Miio Device Library

This is a small library for controlling Mi Home devices that implement the Miio
protocol, such as the Mi Air Purifier.

## Installation

```
npm install --save miio
```

## Usage

```
const { Device } = require('miio');

// Create a new device over the given address
const device = new Device('192.168.100.8');

// Call any method via call
device.call('set_mode', [ 'silent' ])
	.then(console.log)
	.catch(console.error);

// Or use some of the built-in methods
device.setPower(false);

device.getProperties([ 'power', 'mode', 'aqi', 'temp_dec', 'humidity' ])
	.then(console.log)
	.catch(console.error);
```

# Missing features

* No way to automatically discover devices on the local network
* Type specific extensions to `Device`
