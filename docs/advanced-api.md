# Advanced API

## `miio.browse()`

`miio.browse()` can be used to discover devices on the local network.

```javascript
const browser = miio.browse({
  cacheTime: 300 // 5 minutes. Default is 1800 seconds (30 minutes)
});

const devices = {};
browser.on('available', reg => {
  if(! reg.token) {
    console.log(reg.id, 'hides its token');
    return;
  }

  // Directly connect to the device anyways - so use miio.devices() if you just do this
  reg.connect()
    .then(device => {
      devices[reg.id] = device;

      // Do something useful with the device
    })
    .catch(handleErrorProperlyHere);
});

browser.on('unavailable', reg => {
  const device = devices[reg.id];
  if(! device) return;

  device.destroy();
  delete devices[reg.id];
})
```

You can also use mDNS for discovery, but this library does not contain a mDNS
implementation. You can choose a mDNS-implementation suitable for your
needs. Devices announce themselves via `_miio._udp` and should work for most
devices, in certain cases you might need to restart your device to make it
announce itself.

## `device.call(method, args)` - Raw API-usage and calling the Xiaomi miIO-method directly

It's possible to call any method directly on a device without using the
top-level API. This is useful if some aspect of your device is not yet
supported by the library.

```javascript
// Call any method via call
device.call('set_mode', [ 'silent' ])
  .then(console.log)
  .catch(console.error);
```

**Important**: `call` is advanced usage, the library does very little for you
when using it directly. If you find yourself needing to use it, please open
and issue and describe your use case so better support can be added.

## Define custom properties

If you want to define some custom properties to fetch for a device or if your
device is not yet supported you can easily do so:

```javascript
// Define a property that should be monitored
device.defineProperty('mode');

// Define that a certain property should be run through a custom conversion
device.defineProperty('temp_dec', v => v / 10.0);

// Fetch the last value of a monitored property
const value = device.property('temp_dec');
```

## Device management

Get information and update the wireless settings of devices via the management
API.

Discover the token of a device:
```javascript
device.discover()
  .then(info => console.log(info.token));
```

Get internal information about the device:
```javascript
device.management.info()
  .then(console.log);
```

Update the wireless settings:
```javascript
device.management.updateWireless({
  ssid: 'SSID of network',
  passwd: 'Password of network'
}).then(console.log);
```

Warning: The device will either connect to the new network or it will get stuck
without being able to connect. If that happens the device needs to be reset.
