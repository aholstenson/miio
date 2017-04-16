# Device types and capabilities

To make it easier to work with different devices this library normalizes
different models into types. These device types have their own API to match
what the actual device can actually do. In addition each device also has a
set of capabilities, that are used to flag that a device can do something
extra on top of its type API.

## Types

Id                    | Description                                                | Devices
----------------------|------------------------------------------------------------|---------------------
[`switch`](switch.md) | Switchable devices such as power plugs and light switches. | Mi Smart Socket Plug, Aqara Plug, Aqara Light Control
[`controller`](controller.md) | Devices that are primarily used to control something else. | Aqara Button, Aqara Cube, Aqara Light Switch
[`gateway`](gateway.md) | Mi Home Smart Gateway that pulls in sub devices of the Aqara type | Mi Smart Home Gateway 2, Mi Smart Home Gateway 3
[`air-purifier`](air-purifier.md) | Air purifiers and air filtering devices. | Mi Air Purifier, Mi Air Purifier 2 and Mi Air Purifier Pro
[`vacuum`](vacuum.md) | Robot vacuums. | Mi Robot Vacuum

## Capabilities

Id                         | Description
---------------------------|-------------
[`power`](cap-power.md)  | Device supports being switched on or off.
[`power-channels`](cap-power-channels.md) | Device has one or more channels that can be switched on or off. Used for type `switch`.

## Generic devices

The `generic` type is used when a device is of an unknown model. All properties
and methods of generic devices are also available for specific devices types.

### Properties

* `device.defineProperty(string)`, indicate that a property should be fetched from the device
* `device.defineProperty(string, function)`, indicate that a property should be fetched from the device and mapped with the given function.
* `device.setProperty(string, mixed)`, set the value of a property
* `device.monitor()`, monitor the device for changes in defined properties
* `device.stopMonitoring()`, stop monitoring the device for changes
* `device.on('propertyChanged', function)`, receive changes to defined properties
* `device.getProperties(array)`, get the given properties from the device, returns a promise

### Methods

* `device.call(string, array)`, call a method on the device with the given arguments, returns a promise
