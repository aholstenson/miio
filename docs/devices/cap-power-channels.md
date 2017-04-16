# Capability: Power Channels

Id: `power-channels`

Used for devices that support switching one or more channels off. This is used
for all devices of type `switch` which are things such as power plugs and
light switches.

## Properties

* `power`, array with the power state of all channels
* `powerChannelN`, where N is the channel (zero-indexed), boolean indicating if the channel is powered or not

## `device.channels: int`

The number of channels this device supports.

## `device.power(): Array[boolean]`

Get the powered on state of all channels as an array.

## `device.power(channel): boolean`

Get if the given channel is powered on.

## `device.setPower(channel, boolean): Promise`

Switch the power state of the given channel.
