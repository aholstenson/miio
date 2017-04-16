# Robot Vacuum

* `device.type`: `vacuum`
* **Models**: Mi Robot Vacuum
* **Model identifiers**: `rockrobo.vacuum.v1`

## Basic API

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
