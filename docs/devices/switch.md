# Switch

* `device.type`: `switch`
* **Models**: Mi Smart Socket Plug 1 & 2, Aqara Plug, Aqara Light Control (Wall Switch)
* **Model identifiers**: `chuangmi.plug.v1`, `chuangmi.plug.v2`, `chuangmi.plug.m1`, `lumi.plug`, `lumi.ctrl_neutral1`, `lumi.ctrl_neutral2`

The switch type is used for anything that can control the power of one or more
things. Switches always have the capability [`power-channels`](cap-power-channels.md).

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

## Capability: `power-load`

If the device can report how much power is being currently used.

### Properties

* `loadVoltage` - the load voltage in mV
* `loadPower` - the load power in W

## Capability: `power-usage`

If the device can report how much power has been used.

### Properties

* `powerConsumed` - the power consumed in kWh
