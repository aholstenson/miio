# Device types and capabilities

To make it easier to work with different devices this library normalizes
different models into types. These device types have their own API to match
what the actual device can actually do. In addition each device also has a
set of capabilities, that are used to flag that a device can do something
extra on top of its type API.

## Types

Name                  | Description                                                | Devices
----------------------|------------------------------------------------------------|---------------------
[Power strips](power-strip.md) | Power strip with one or more power channels. | Mi Smart Power Strip
[Power plugs](power-plug.md) | Switchable power plug with one or more power channels | Mi Smart Socket Plug, Aqara Plug
[Power outlets](power-outlet.md) | Wall mounted outlet | None yet
[Wall switches](wall-switch.md) | Wall mounted switch with one or more individual power channels. | Aqara Light Control
[Controllers](controller.md) | Devices that are primarily used to control something else. | Aqara Button, Aqara Cube, Aqara Light Switch
[Gateways](gateway.md) | Mi Smart Home Gateway that pulls in sub devices of the Aqara type | Mi Smart Home Gateway 2, Mi Smart Home Gateway 3
[Air purifiers](air-purifier.md) | Air purifiers and air filtering devices. | Mi Air Purifier, Mi Air Purifier 2 and Mi Air Purifier Pro
[Humidifiers](humidifier.md) | Humidifier. | Mi Humidifier
[Vacuum](vacuum.md) | Robot vacuums. | Mi Robot Vacuum
[Lights](light.md) | For any type of lights. | Mi Yeelights

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
Mi Air Purifier 1             | Air purifier  | Yes        | ⚠️ Untested  |
Mi Air Purifier 2             | Air purifier  | Yes        | ✅ Good      |
Mi Air Purifier Pro           | Air purifier  | Yes        | ✅ Basic     | Some of the new features and sensors are not supported.
Mi Flora                      | -             | -          | ❌ None      | Communicates using Bluetooth.
Mi Lunar Smart Sleep Sensor   | Generic       | Yes        | ⚠️ Generic   |
Mi Robot Vacuum               | Vacuum        | No         | ✅ Basic     | DND, timers and mapping features are not supported.
Mi Smart Socket Plug          | Power plug    | Yes        | ✅ Good      |
Mi Smart Socket Plug 2        | Power plug    | Yes        | ✅ Good      |
Mi Smart Home Gateway 1       | -             | Yes        | ⚠️ Generic   | API used to access sub devices not supported.
Mi Smart Home Gateway 2       | Gateway       | Yes        | ✅ Basic     | Light, sound and music features not supported.
Mi Smart Home Gateway 3       | Gateway       | Yes        | ✅ Basic     | Light, sound and music features not supported.
Mi Smart Home Cube            | Controller    | Yes        | ✅ Excellent | Aqara device via Smart Home Gateway
Mi Smart Home Light Switch    | Controller    | Yes        | ⚠️ Untested  | Aqara device via Smart Home Gateway.
Mi Smart Home Light Control   | Wall switch   | Yes        | ⚠️ Untested  | Aqara device via Smart Home Gateway. Controls power to one or two lights.
Mi Smart Home Temperature and Humidity Sensor | Sensor        | Yes        | Excellent | Aqara device via Smart Home Gateway.
Mi Smart Home Wireless Switch | Controller    | Yes        | ✅ Excellent | Aqara device via Smart Home Gateway.
Mi Smart Home Door / Window Sensor | Sensor   | Yes        | ⚠️ Untested  | Aqara device via Smart Home Gateway.
Mi Smart Home Occupancy Sensor | Sensor       | Yes        | ⚠️ Untested  | Aqara device via Smart Home Gateway.
Mi Smart Home Aqara Plug      | Power plug    | Yes        | ⚠️ Untested  | Aqara device via Smart Home Gateway.
Mi Smart Home Smoke Sensor    | -             | Yes        | ❓ Unknown   | Aqara device - unknown support
Mi Smart Home Gas Sensor      | -             | Yes        | ❓ Unknown   | Aqara device - unknown support
Mi Smart Home Outlet          | -             | Yes        | ❓ Unknown   | Aqara device - unknown support
Mi Smart Power Strip 1        | Power strip   | Unknown    | ✅ Basic     | Setting power and mode is untested.
Mi Smart Power Strip 2        | Power strip   | Unknown    | ✅ Basic     | Setting power and mode is untested.
Mi Rice Cooker                | -             | Unknown    | ❓ Unknown   |
Mi Humidifier                 | Humidifier    | Yes        | ✅ Good      |
Mi Smart Fan                  | Generic       | Unknown    | ⚠️ Generic   |
Mi Air Quality Monitor (PM2.5)| Sensor        | Unknown    | ✅ Good      |
Yeelight Desk Lamp            | Light         | No         | ✅ Good      |
Yeelight Color Bulb           | Light         | No         | ✅ Good      | 
Yeelight White Bulb           | Light         | No         | ✅ Good      |
Yeelight LED Strip            | Light         | No         | ⚠️ Untested  |
Yeelight Ceiling Lamp         | -             | -          | ❓ Unknown   |
Yeelight Bedside Lamp         | -             | -          | ❓ Unknown   |
Mi Washing Machine            | -             | -          | ❓ Unknown   |
Mi IR Remote                  | -             | -          | ❓ Unknown   |

### Models by identifier

__Note:__ This table does not include Aqara (Smart Home Gateway) devices as their model identifier is set based on the type of the device.

Id                        | Type              | Auto-token | Support      | Note
--------------------------|-------------------|------------|--------------|------
`zhimi.airpurifier.m1`    | Air Purifier      | Yes        | ✅ Good      |
`zhimi.airpurifier.v1`    | Air Purifier`     | Yes        | ✅ Good      |
`zhimi.airpurifier.v2`    | Air Purifier      | Yes        | ✅ Good      |
`zhimi.airpurifier.v3`    | Air Purifier      | Unknown    | ⚠️ Untested  |
`zhimi.airpurifier.v4`    | -                 | Unknown    | ⚠️ Generic   | Testing needed to check compatibility.
`zhimi.airpurifier.v5`    | -                 | Unknown    | ⚠️ Generic   | Testing needed to check compatibility.
`zhimi.airpurifier.v6`    | Air Purifier      | Yes        | ✅ Basic     |
`zhimi.humidifier.v1`     | Humidifier        | Unknown    | ⚠️ Untested  |
`chuangmi.plug.m1`        | Power plug        | Yes        | ✅ Good      |
`chuangmi.plug.v1`        | Power plug        | Yes        | ✅ Good      |
`chuangmi.plug.v2`        | Power plug        | Yes        | ✅ Good      |
`qmi.powerstrip.v1`       | Power strip       | Yes        | ⚠️ Untested  |
`zimi.powerstrip.v2`      | Power strip       | Yes        | ⚠️ Untested  |
`rockrobo.vaccum.v1`      | Vacuum            | No         | ✅ Basic     | DND, timers and mapping features are not supported.
`rockrobo.vaccum.s5`      | Vacuum            | No         | ✅ Basic     | DND, timers and mapping features are not supported.
`lumi.gateway.v1`         | Generic           | Yes        | ⚠️ Generic   | API used to access sub devices not supported.
`lumi.gateway.v2`         | Gateway           | Yes        | ✅ Basic     |
`lumi.gateway.v3`         | Gateway           | Yes        | ✅ Basic     |
`yeelink.light.lamp1`     | Light             | No         | ✅ Good      |
`yeelink.light.mono1`     | Light             | No         | ✅ Good      |
`yeelink.light.color1`    | Light             | No         | ✅ Good      | 
`yeelink.light.strip1`    | Light             | No         | ⚠️ Untested  | Support added, verification with real device needed.
