# Protocol and commands

The base protocol is based on documentation provided by OpenMiHome. See https://github.com/OpenMiHome/mihome-binary-protocol for details. This
protocol defines how packets are sent to and from the devices are structured,
but does not describe the commands that can be issued to the devices.

Currently the best way to figure out what commands a device supports is to
run a packet capture with Wireshark between the Mi Home app and your device.
The `miio` command line app can the be used together with JSON export from
Wireshark to extract messages sent back and forth.

First make sure you have installed the `miio` app:

`npm install -g miio`

## Creating a capture

### Figure out your device token before starting

If you do not have the token of your device yet, run `miio --discover` to list
devices on your network and their auto-extracted tokens. If the token is not
found, follow the [instructions to find device tokens](tokens.md). This needs
to be done before you start your capture or the capture will be useless as
resetting the device will generate a new token.

### Running Wireshark and Mi Home

If you have knowledge about Wireshark you can run a capture however you like,
but if you do not the easiest way is to use the method described in the
readme of [Homey app for Xiaomi Mi Robot Vaccum Cleaner](https://github.com/jghaanstra/com.robot.xiaomi-mi) to capture the
traffic.

## Analyzing the capture

### Exporting the packets as JSON

The first step is to export the capture from Wireshark as a JSON file. You
should be able to extract a file with all your traffic, but you might want to
apply a filter in Wireshark to limit the size of the file.

A good starting filter is: `udp.dstport == 54321 or udp.srcport == 54321`

### Running the `miio` app

To extract messages sent back and forth and dump to your terminal:

`miio protocol json-dump path/to/file.json --token tokenAsHex`

### Figuring out the output

The output will be filled with output such as this:

```
-> 192.168.100.7 data={"id":10026,"method":"get_status","params":[]}
<- 192.168.100.8 data={ "result": [ { "msg_ver": 4, "msg_seq": 238, "state": 6, "battery": 100, "clean_time": 21, "clean_area": 240000, "error_code": 0, "map_present": 1, "in_cleaning": 0, "fan_power": 60, "dnd_enabled": 1 } ], "id": 10026 }
```

Lines starting with `->` are messages sent to a device and `<-` are messages
from a device. If the data is `N/A` it was either a handshake or the message
could not be decoded due to an invalid token.

The `method` and `params` property in outgoing messages can be plugged into
`device.call(method, params)` to perform the same call. Go through and see what
the Mi Home app calls and how the replies look.

## Testing commands

The `miio` command line app can be used to control devices and test things
when you are implementing or debugging your device.

Use the `--control` flag to issue a command:

`miio protocol call id-or-address nameOfMethod paramsAsJSON`

For example to get a property from the device:

`miio protocol call id-or-address get_prop '["temperature","use_time"]'`
