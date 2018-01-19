# Missing devices

This library does not yet support all Mi Home devices that speak the
miIO protocol.

## Can my device be supported?

The command line application can help with discovering if a device speaks the
miIO protocol. Get started by installing the command line application:

`npm install -g miio`

Run the app in discovery mode to list devices on your network:

`miio discover`

This will start outputting all of the devices found, with their address,
identifiers, models and tokens (if found). If your device can be supported it
will show up in this list. You might need to figure out if the IP of your device
to be able to find it easily.

If the device shows up feel free to open an issue about supporting the device.
Include this information:

* The name of the device model - such Mi Air Purifier or Mi Smart Power Strip 2
* The model id from the output
* If the token for the device displayed N/A or a hex value (don't include the hex value)

## Implementing a device

If a device can be supported the next step is to figure out what commands the
device supports. You can help by either forking this repository and
implementing the device or by opening an issue with information about what
the device seems to support.

In certain cases its possible to find documentation or someone that has already
done most of the work figuring out what commands a device supports.

Most often this involves more advanced steps like packet capturing via a local
Android emulator. Details about that can be found under [Protocol and commands](protocol.md)
if you feel up for it.

## Donating devices

If you really want a device to be supported it's possible to contact the author
of this library to discuss donating a device. Be aware that this is not a
guarantee that this library will support the device as sometimes it might
not be possible to figure out how to support a device.
