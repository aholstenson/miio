# Device types and capabilities

To make it easier to work with different devices this library normalizes
different models into types. These device types have their own API to match
what the actual device can actually do. In addition each device also has a
set of capabilities, that are used to flag that a device can do something
extra on top of its type API.

## Types

Id                    | Description                                                | Devices
----------------------|------------------------------------------------------------|---------------------
[`power-switch`](power-switch.md) | Generic switchable devices with one or more power channels. | Aqara Light Control
[`power-strip`](power-strip.md) | Power strip with one or more power channels. | Mi Smart Power Strip
[`power-plug`](power-plug.md) | Switchable power plug with one or more power channels | Mi Smart Socket Plug, Aqara Plug
[`power-outlet`](power-outlet.md) | Wall mounted outlet | None yet
[`controller`](controller.md) | Devices that are primarily used to control something else. | Aqara Button, Aqara Cube, Aqara Light Switch
[`gateway`](gateway.md) | Mi Smart Home Gateway that pulls in sub devices of the Aqara type | Mi Smart Home Gateway 2, Mi Smart Home Gateway 3
[`air-purifier`](air-purifier.md) | Air purifiers and air filtering devices. | Mi Air Purifier, Mi Air Purifier 2 and Mi Air Purifier Pro
[`humidifier`](humidifier.md) | Humidifier | Mi Humidifier
[`vacuum`](vacuum.md) | Robot vacuums. | Mi Robot Vacuum
[`light`](light.md) | For any type of lights | Mi Yeelights
[`sensor`](sensor.md) | For anything that primarily reads values | Aqara Temperature and Humidity Sensor

## Capabilities

Id                         | Description
---------------------------|-------------
[`power`](cap-power.md)  | Device supports being switched on or off.
[`power-channels`](cap-power-channels.md) | Device has one or more channels that can be switched on or off. Used for type `switch`.
[`power-load`](cap-power-load.md) | Device can report how much power is currently used
[`power-usage`](cap-power-usage.md) | Device can report how much power has been used
[`sensor`](sensor.md) | Device measures one or more values
[`temperature`](sensor.md) | Device measures the current temperature
[`humidity`](sensor.md) | Device measures the current relative humidity
[`aqi`](sensor.md) | Device measures current air quality
[`illuminance`](sensor.md) | Device measures illuminance in Lux

## Models

The tables below indicates how well different devices are supported. The support
column can be one of the following:

* ❓ Unknown - support for this device is unknown, you can help test it if you have access to it
* ❌ None - this device is not a miIO-device or has some quirk making it unusable
* ⚠️ Generic - this device is supported via the generic API but does not have a high-level API
* ⚠️ Untested - this device has an implementation but needs testing with a real device
* ✅ Basic - the basic functionality of the device is implemented, but more advanced features are missing
* ✅ Good - most of the functionality is available including some more advanced features such as settings
* ✅ Excellent - as close to complete support as possible

If your device:

* Is not in this list, it might still be a miIO-device and at least have generic support. See [Missing devices](../missing-devices.md) for information about how to find out.
* Needs a manual token and the table says it should not, something has probably changed in the firmware, please open an issue so the table can be adjusted.
* Is marked as Untested you can help by testing the implementation is this library and opening an issue with information about the result.

### Models by name

Name                          | Type          | Auto-token | Support     | Note
------------------------------|---------------|------------|-------------|--------
Mi Air Purifier 1              | `air-purifier` | Yes        | ⚠️ Untested  |
Mi Air Purifier 2              | `air-purifier` | Yes        | ✅ Good      |
Mi Air Purifier Pro            | `air-purifier` | Yes        | ✅ Basic     | Some of the new features and sensors are not supported.
Mi Flora                      | -             | -          | ❌ None      | Communicates using Bluetooth.
Mi Lunar Smart Sleep Sensor   | `generic`     | Yes        | ⚠️ Generic   |
Mi Robot Vacuum               | `vacuum`      | No         | ✅ Basic     | DND, timers and mapping features are not supported.
Mi Smart Socket Plug          | `switch`      | Yes        | ✅ Good      |
Mi Smart Socket Plug 2        | `switch`      | Yes        | ✅ Good      |
Mi Smart Home Gateway 1       | -             | Yes        | ⚠️ Generic   | API used to access sub devices not supported.
Mi Smart Home Gateway 2       | `gateway`     | Yes        | ✅ Basic     | Light, sound and music features not supported.
Mi Smart Home Gateway 3       | `gateway`     | Yes        | ✅ Basic     | Light, sound and music features not supported.
Mi Smart Home Cube            | `controller`  | Yes        | ✅ Excellent | Aqara device via Smart Home Gateway
Mi Smart Home Light Switch    | `controller`  | Yes        | ⚠️ Untested  | Aqara device via Smart Home Gateway.
Mi Smart Home Light Control   | `switch`      | Yes        | ⚠️ Untested  | Aqara device via Smart Home Gateway. Controls power to one or two lights.
Mi Smart Home Temperature and Humidity Sensor | `sensor`        | Yes        | Excellent | Aqara device via Smart Home Gateway.
Mi Smart Home Wireless Switch | `controller`  | Yes        | ✅ Excellent | Aqara device via Smart Home Gateway.
Mi Smart Home Door / Window Sensor | `magnet` | Yes        | ⚠️ Untested  | Aqara device via Smart Home Gateway.
Mi Smart Home Occupancy Sensor | `motion`     | Yes        | ⚠️ Untested  | Aqara device via Smart Home Gateway.
Mi Smart Home Aqara Plug      | `switch`      | Yes        | ⚠️ Untested  | Aqara device via Smart Home Gateway.
Mi Smart Home Smoke Sensor    | -             | Yes        | ❓ Unknown   | Aqara device - unknown support
Mi Smart Home Gas Sensor      | -             | Yes        | ❓ Unknown   | Aqara device - unknown support
Mi Smart Home Outlet          | -             | Yes        | ❓ Unknown   | Aqara device - unknown support
Mi Smart Power Strip 1        | `switch`      | Unknown    | ✅ Basic     | Setting power and mode is untested.
Mi Smart Power Strip 2        | `switch`      | Unknown    | ✅ Basic     | Setting power and mode is untested.
Mi Rice Cooker                | -             | Unknown    | ❓ Unknown   |
Mi Humidifier                  | -             | Unknown    | ⚠️ Untested  |
Mi Smart Fan                  | `generic`     | Unknown    | ⚠️ Generic   |
Mi Air Quality Monitor (PM2.5)| `generic`     | Unknown    | ⚠️ Generic   |
Yeelight Desk Lamp            | `light`       | No         | ✅ Basic     |
Yeelight Color Bulb           | `light`       | No         | ⚠️ Untested  | Setting RGB needs testing. Hue and saturation not added.
Yeelight White Bulb           | `light`       | No         | ⚠️ Untested  |
Yeelight LED Strip            | `light`       | No         | ⚠️ Untested  |
Yeelight Ceiling Lamp         | -             | -          | ❓ Unknown   |
Yeelight Bedside Lamp         | -             | -          | ❓ Unknown   |
Mi Washing Machine            | -             | -          | ❓ Unknown   |
Mi IR Remote                  | -             | -          | ❓ Unknown   |

### Models by identifier

__Note:__ This table does not include Aqara (Smart Home Gateway) devices as their model identifier is set based on the type of the device.

Id                        | Type              | Capabilities                                        | Auto-token | Support   | Note
--------------------------|-------------------|-----------------------------------------------------|------------|-----------|------
`zhimi.airpurifier.m1`     | `air-purifier`     | `power`, `sensor`, `temperature`, `humidity`, `aqi` | Yes        | ✅ Good      |
`zhimi.airpurifier.v1`     | `air-purifier`     | `power`, `sensor`, `temperature`, `humidity`, `aqi` | Yes        | ✅ Good      |
`zhimi.airpurifier.v2`     | `air-purifier`     | `power`, `sensor`, `temperature`, `humidity`, `aqi` | Yes        | ✅ Good      |
`zhimi.airpurifier.v3`     | `air-purifier`     | `power`, `sensor`, `temperature`, `humidity`, `aqi` | Unknown    | ⚠️ Untested  |
`zhimi.airpurifier.v4`     | -                 |                                                     | Unknown    | ⚠️ Generic   | Testing needed to check compatibility with `air-purifier` type.
`zhimi.airpurifier.v5`     | -                 |                                                     | Unknown    | ⚠️ Generic   | Testing needed to check compatibility with `air-purifier` type.
`zhimi.airpurifier.v6`     | `air-purifier`     | `power`, `sensor`, `temperature`, `humidity`, `aqi` | Yes        | ✅ Basic     |
`zhimi.humidifier.v1`      | `humdifier`     | `power`, `sensor`, `temperature`, `humidity`           | Unknown    | ⚠️ Untested  |
`chuangmi.plug.m1`        | `power-plug`      | `power-channels`                                    | Yes        | ✅ Good      |
`chuangmi.plug.v1`        | `power-plug`      | `power-channels`                                    | Yes        | ✅ Good      |
`chuangmi.plug.v2`        | `power-plug`      | `power-channels`                                    | Yes        | ✅ Good      |
`qmi.powerstrip.v1`       | `power-strip`     | `power-channels`                                    | Yes        | ⚠️ Untested  |
`zimi.powerstrip.v2`      | `power-strip`     | `power-channels`                                    | Yes        | ⚠️ Untested  |
`rockrobo.vaccum.v1`      | `vacuum`          |                                                     | No         | ✅ Basic     | DND, timers and mapping features are not supported.
`lumi.gateway.v1`         | `generic`         |                                                     | Yes        | ⚠️ Generic   | API used to access sub devices not supported.
`lumi.gateway.v2`         | `gateway`         |                                                     | Yes        | ✅ Basic     |
`lumi.gateway.v3`         | `gateway`         |                                                     | Yes        | ✅ Basic     |
`yeelink.light.lamp1`     | `light`           | `power`, `color:temperature`                        | No         | ✅ Good      |
`yeelink.light.mono1`     | `light`           | `power`, `color:temperature`                        | No         | ✅ Good      |
`yeelink.light.color1`    | `light`           | `power`, `color:temperature`, `color:full`          | No         | ⚠️ Untested  | Setting colors has not been tested.

## Generic devices

The `generic` type is used when a device is of an unknown model. All properties
and methods of generic devices are also available for specific devices types.

### Properties

* `device.defineProperty(string)`, indicate that a property should be fetched from the device
* `device.defineProperty(string, function)`, indicate that a property should be fetched from the device and mapped with the given function.
* `device.setProperty(string, mixed)`, set the value of a property
* `device.getProperties(Array[string]): Object`, get the given properties if they are monitored
* `device.monitor()`, monitor the device for changes in defined properties
* `device.stopMonitoring()`, stop monitoring the device for changes
* `device.on('propertyChanged', function)`, receive changes to defined properties

* `device.loadProperties(Array[string])`, load properties from the device

### Methods

* `device.call(string, array)`, call a method on the device with the given arguments, returns a promise
