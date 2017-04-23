# Capability: Power Channels

Id: `power-channels`

Used for devices that support switching one or more channels off. This is used
for all devices of type `switch` which are things such as power plugs and
light switches.

## Properties

* `power`, array with the power state of all channels
* `powerChannelNAME`, where NAME is the channel with the first letter uppercase, boolean indicating if the channel is powered or not

## `device.powerChannels: Array[string]`

The channels this device supports.

## `device.power(): Object`

Get the powered on state of all channels as an object with keys for each channel.

## `device.power(channel): boolean`

Get if the given channel is powered on.

## `device.setPower(channel, boolean): Promise`

Switch the power state of the given channel.
