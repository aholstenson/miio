# Power Switch

* `device.type`: `power-switch`
* **Models**: Aqara Light Control (Wall Switch)
* **Model identifiers**: `lumi.ctrl_neutral1`, `lumi.ctrl_neutral2`

The switch type is used for devices that can control the power of one or more
things. Switches always have the capability [`power-channels`](cap-power-channels.md).

Supports the capabilities [`power-load`](cap-power-load.md)  and [`power-usage`](cap-power-usage.md).

## Basic API

### Properties

* `power`, array with the power state of all channels
* `powerChannelN`, where N is the channel (zero-indexed), boolean indicating if the channel is powered or not

### `device.channels: int`

The number of channels this device supports.

### `device.power(): Array[boolean]`

Get the powered on state of all channels as an array.

### `device.power(channel): boolean`

Get if the given channel is powered on.

### `device.setPower(channel, boolean): Promise`

Switch the power state of the given channel.
