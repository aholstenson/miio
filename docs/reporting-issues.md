# Reporting issues

Any report of issues within `miio` library is welcome. This includes both
bugs and feature requests, within the generic part of related to a specific
device.

There are a few things that can help with solving your issue.

## Missing support for a device

If your device is unsupported you can check the [list of supported devices](devices/README.md)
to see if your device is or can be supported. If you do not see it in the list
or if it is listed as Unknown you can read more about figuring out if your
[device can be supported](missing-devices.md).

## Something with your device does not work

To make debugging an issue with your device easier it helps to include some
debug information. You will need to have the `miio` command line interface
installed to get some of this information. You can install it via `npm` in a
terminal window:

`npm install -g miio`

The `miio` tool comes with a command for inspecting a device. You will need
either the device id or address of your device. To use the inspect tool run:

`miio inspect id-or-address`

This will find the device on your network, connect to it and fetch some debug
information. Including that information when you open an issue will be of great
help. You can safely exclude the IP and token of your device and any properties
that include sensitive information.

If you do not know the id or address of your device, try running `miio discover`
to list all devices on your network.

## Other bugs

The more details you can share about a bug the better. If you have a small
test case including it will be greatly appreciated.

## Feature requests

Open an issue and describe the feature you want. If its related to a device
you can include the same information as described in the section
"Something with your device does not work".
