# Gateway

* `device.type`: `gateway`
* **Models**: Mi Smart Home Gateway 2 and 3
* **Model identifiers**: `lumi.gateway.v2`, `lumi.gateway.v3`

Support for the Mi Smart Home Gateway that provides access to a set of smaller
devices such as switches, motion detection and temperature and humidity sensors.

**Note** To fully support the gateway this library will automatically enable
the Local Developer API of the gateway. If it is already enabled the existing
key is used but if not a new key is generated and set for the API.

## Basic API

### Event: `deviceAvailable`

Emitted when a device is available for access via the gateway. The payload is
the device instance.

### Event: `deviceUnavailable`

Emitted when a device is no longer available for access via the gateway.

### `device.devices: Array[SubDevice]`

List the current devices that are available.

### `device.addDevice()`

Tell the gateway that a new device should be added. The actual Aqara device
needs to be reset, which is a different procedure for each device. The device
has 30 seconds to join the gateway.

### `device.stopAddDevice()`

Tell the gateway that you no longer want to add a new device.

### `device.removeDevice(id)`

Remove a device from the gateway using its identifier.
