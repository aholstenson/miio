# Device management

The `miio` command line utility supports many device operations, including
discovering and configuring devices.

## Install the command line tool

You can install the command line tool with:

`npm install -g miio`

## Discovering devices on current network

`miio --discover`

This will list devices that are connected to the same network as your computer.
Let it run for a while so it has a chance to reach all devices, as it might
take a minute or two for all devices to answer.

The commands outputs each device on this format:

```
Device ID: 48765421
Model ID: zhimi.airpurifier.m1
Type: air-purifier
Address: 192.168.100.8 (zhimi-airpurifier-m1_miio48765421)
Token: token-as-hex-here
```

The information output is:

* __Device ID__ - the unique identifier of the device, does not change if the device is reset.
* __Model ID__ - the model id if it could be determined, this indicates what type of device it is
* __Type__ - if the model id was found this indicates what type of device it will be mapped to
* __Address__ - the IP and hostname that the device has been given
* __Token__ - the token of the device or N/A if it could not be automatically determined

## Changing the WiFi settings of a device

`miio --configure id-or-address --ssid network-ssid --passwd network-password`

Options:

* `--ssid` - the required SSID of the 2.4 GHz WiFi network that the device should connect to
* `--passwd` - the password of the WiFi network
* `--token` - optional token of the device, if the token can not be automatically determined

_Warning:_ This command does not verify that the device can actually connect to
the network. If it can not it will be stuck and will need to be reset.

## Configuring a new device

If you have gotten a new device the `--configure` flag can also be used to
configure this new device without using the Mi Home app.

1. The Mi Home device will create a wireless network, connect your computer to this network. Your device model will be included in the name such as: `zhimi-airpurifier-m1_miapdf91`.
2. _Optional:_ Run `miio --discover` to make sure you can see your device.
3. Configure the WiFi: `miio --configure --ssid ssid-of-network --passwd password-of-network`. See above for details about the flags.
4. After the device has been configured the token is saved locally and made available to on your current machine. If you don't need the token locally you can also now copy the token and transfer it to where it is needed.
5. Reconnect to your regular network.
6. _Optional:_ Run `miio --discover` again to make sure the device actually connected to the network.

If the device does not show up on your main network the problem is probably one of:

* Wrong SSID - check that the SSID you gave the `--configure` command is correct.
* Wrong password - check that the password is correct for the WiFi network.
* Not a 2.4 GHz network - make sure to use a 2.4 GHz network as 5 GHz networks are not supported.

You will need to reset the device to try another connection.

## Resetting a device

There is currently no way to do this via the client, see your manual for how to
do it with your device. It usually involves pressing one or two buttons for
5 to 10 seconds. The buttons can either be visible or hidden behind a pinhole.
