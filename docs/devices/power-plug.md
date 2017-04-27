# Power Plug

* `device.type`: `power-plug`
* **Models**: Mi Smart Socket Plug, Aqara Plug
* **Model identifiers**: `chuangmi.plug.v1`, `chuangmi.plug.v2`, `chuangmi.plug.m1`, `lumi.plug`

Similar to the more generic type [`power-switch`](power-switch.md) but represents a power
plug that can be connected to a socket. Always has the capability
[`power-channels`](cap-power-channels.md) and can support more than one channel.

Supports the capabilities [`power-load`](cap-power-load.md)  and [`power-usage`](cap-power-usage.md).

## Basic API

### Properties

* `power`, array with the power state of all channels
* `powerChannelNAME`, where NAME is the channel with the first letter uppercase, boolean indicating if the channel is powered or not

### `device.powerChannels: Array[string]`

The channels this device supports.

### `device.power(): Object`

Get the powered on state of all channels as an object with keys for each channel.

### `device.power(channel): boolean`

Get if the given channel is powered on.

### `device.setPower(channel, boolean): Promise`

Switch the power state of the given channel.
