# Device types

## Generic

The generic type is used when a device is of an unknown model. All properties
and methods of generic devices are also available for specific devices types.

### Properties

* `device.defineProperty(string)`, indicate that a property should be fetched from the device
* `device.defineProperty(string, function)`, indicate that a property should be fetched from the device and mapped with the given function.
* `device.monitor()`, monitor the device for changes in defined properties
* `device.stopMonitoring()`, stop monitoring the device for changes
* `device.on('propertyChanged', function)`, receive changes to defined properties
* `device.getProperties(array)`, get the given properties from the device, returns a promise

### Methods

* `device.call(string, array)`, call a method on the device with the given arguments, returns a promise
* `device.setPower(boolean)`, change the power state of the device

## Air Purifier

* **Models**: Mi Air Purifer 1 & 2 (and maybe Pro)
* **Model identifiers**: `zhimi.airpurifier.m1`, `zhimi.airpurifier.v1`, `zhimi.airpurifier.v2`
* `device.type`: `air-purifier`

### Properties

* `power`, boolean indicating the power state of the device
* `mode`, string indicating the current mode
* `temperature`, number indicating the temperature in Celsius
* `humidity`, number indicating the relative humidity in percent
* `aqi`, number indicating the air quality index (based on PM2.5)

### Power

* `device.power`, read-only boolean indicating if the device is powered on
* `device.setPower(boolean)`, change the power state of the device, returns a promise

### Modes

The air purifiers have different modes that controls their speed.

* `device.mode`, read-only string indicating the current mode
* `device.modes`, read-only array indicating the modes supports by the device
* `device.setMode(string)`, set the current mode of the device, returns a promise

The modes are currently:

* `idle`, turn the device off
* `auto`, set the device to automatic mode where it controls the speed itself
* `silent`, lowest speed, for silent operation or night time
* `low`, low speed
* `medium`, medium speed
* `high`, high speed

### Sensor values

* `temperature` - number indicating the temperature in Celsius
* `humidity` - number indicating the relative humidity in percent
* `aqi` - number indicating the Air Quality Index (based on PM2.5)

## Switch

* **Models**: Mi Smart Socket Plug 1 & 2
* **Model identifiers**: `chuangmi.plug.v1`, `chuangmi.plug.v2`, `chuangmi.plug.m1`
* `device.type`: `switch`

### Properties

* `power`, boolean indicating the power state of the device

### Power

* `device.power`, read-only boolean indicating if the device is powered on
* `device.setPower(boolean)`, change the power state of the device, returns a promise

## Robot Vacuum

* **Models**: Mi Robot Vacuum
* **Model identifiers**: `rockrobo.vacuum.v1`
* `device.type`: `vacuum`

### Properties

* `state`, state of the vacuum, one of `charger-offline`, `cleaning`, `returning`, `charging`, `paused`, `spot-cleaning` or `unknown-#` where # is a number
* `error_code`, object describing errors encountered by the vacuum
* `battery`, number indicating the battery level between 0 and 100

### Cleaning

* `device.state`, the state of the vacuum, see Properties for details
* `device.charging`, boolean indicating that the state is `charging`
* `device.cleaning`, boolean indicating that the state is either `cleaning` or `spot-cleaning`
* `device.start()`, start the vacuum cleaner, returns a promise
* `device.pause()`, pause the vacuum cleaner, returns a promise
* `device.stop()`, stop the vacuum cleaner without returning to the charging station, returns a promise
* `device.charge()`, tell the vacuum cleaner to stop and to return to the charging station, returns a promise
* `device.spotClean()`, start spot cleaning, returns a promise

## Cleaning History

* `device.getHistory()`, get a history overview, returns a promise that includes the number of times the device has run and which days it has been active on
* `device.getHistoryForDay(day)`, get details for the given day (from `getHistory()`), return a promise that resolves an object containing a property `history` which is all the times the vacuum was used on that day

## Various

* `device.find()`, make some noice so the vacuum can be found
* `device.battery`, battery level in percent
* `device.fanPower`, the fan power (vacuum) in percent
* `device.setFanPower(number)`, update the fan power (vacuum) of the device, returns a promise
