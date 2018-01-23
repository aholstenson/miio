# Device management

The `miio` command line utility supports many device operations, including
discovering and configuring devices. It is also the primary tool used for
managing access to devices by storing tokens of devices.

## Install the command line tool

You can install the command line tool with:

`npm install -g miio`

## Discovering devices on current network

`miio discover`

This will list devices that are connected to the same network as your computer.
Let it run for a while so it has a chance to reach all devices, as it might
take a minute or two for all devices to answer.

The commands outputs each device on this format:

```
Device ID: 48765421
Model info: zhimi.airpurifier.m1
Address: 192.168.100.9
Token: token-as-hex-here via auto-token
Support: At least basic
```

The information output is:

* __Device ID__ - the unique identifier of the device, does not change if the device is reset.
* __Model ID__ - the model id if it could be determined, this indicates what type of device it is
* __Address__ - the IP that the device has on the network
* __Token__ - the token of the device or ??? if it could not be automatically determined

### Storing tokens of all discovered devices

As future firmware updates might start hiding the token of a device it is a good
idea to sync the tokens to the local token storage. Use the flag `--sync` to
enable this:

`miio discover --sync`

## Changing the WiFi settings of a device

`miio configure id-or-address --ssid network-ssid --passwd network-password`

Options:

* `--ssid` - the required SSID of the 2.4 GHz WiFi network that the device should connect to
* `--passwd` - the password of the WiFi network

_Warning:_ This command does not verify that the device can actually connect to
the network. If it can not it will be stuck and will need to be reset.

## Configuring a new device

If you have gotten a new device the `--configure` flag can also be used to
configure this new device without using the Mi Home app.

1. The Mi Home device will create a wireless network, connect your computer to this network. Your device model will be included in the name such as: `zhimi-airpurifier-m1_miapdf91`.
2. Run `miio discover` to make sure you can see your device. Make a note of the address (IP) or id.
3. Configure the WiFi: `miio id-or-address configure --ssid ssid-of-network --passwd password-of-network`. See above for details about the flags.
4. After the device has been configured the token is saved locally and made available to on your current machine. If you don't need the token locally you can also now copy the token and transfer it to where it is needed.
5. Reconnect to your regular network.
6. _Optional:_ Run `miio discover` again to make sure the device actually connected to the network.

If the device does not show up on your main network the problem is probably one of:

* Wrong SSID - check that the SSID you gave the `--configure` command is correct.
* Wrong password - check that the password is correct for the WiFi network.
* Not a 2.4 GHz network - make sure to use a 2.4 GHz network as 5 GHz networks are not supported.

You will need to reset the device to try another connection.

## Resetting a device

There is currently no way to do this via the client, see your manual for how to
do it with your device. It usually involves pressing one or two buttons for
5 to 10 seconds. The buttons can either be visible or hidden behind a pinhole.

## Getting the token of a device

Some Mi Home devices hide their token and require a reset and reconfiguration
before the device can be used. If you do not use the Mi Home app, do a
reset and the follow the section _Configuring a new device_ found above.

### Getting the token when using the Mi Home app

1. Reset your Mi Home device. This will reset the token and remove the device from the Mi Home app - you will need to readd it later. Check the manual of your device to find out how to perform a reset.
2. The Mi Home device will create a wireless network, connect your computer to this network. Your device model will be included in the name such as: `zhimi-airpurifier-m1_miapddd8`.
3. Run `miio discover --sync` in a terminal window.
4. a) If you are using the device on the current machine the token has been saved and is now available locally.<br>b) If you need the token somewhere else copy the token as displayed, add it wherever you need to and store a copy somewhere.
5. Press Ctrl+C to stop the discovery.
6. Reconnect to your regular wireless network.
7. Readd the device in the Mi Home app so that it has access to your regular wireless network.

## Setting the token of a device

If you want to update the token of a device use the `tokens update` command:

`miio tokens update id-or-address --token token-as-hex`

This is mostly used when you configured the device on another computer but want
to use another computer to have access to the device. Make sure to run the
`miio` command as the correct user as tokens are stored tied to the current
user.
