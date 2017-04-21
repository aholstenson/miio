# Getting the token of devices

Speaking with Mi Home devices requires a token, for some devices the token can
be fetched automatically, but most devices only reveal their token when they
are uninitialized.

The `miio` command helps with fetching the token of an uninitialized device.

First install `miio` as a global library:

```
npm install -g miio
```

To find the token of your device:

1. Reset your Mi Home device. This will reset the token and remove the device from the Mi Home app - you will need to readd it later. Check the manual of your device to find out how to perform a reset.
2. The Mi Home device will create a wireless network, connect your computer to this network. Your device model will be included in the name such as: `zhimi-airpurifier-m1_miapddd8`.
3. Run `miio --discover --sync` in a terminal window.
4. a) If you are using the device on the current machine the token has been saved and is now available locally.<br>b) If you need the token somewhere else copy the token as displayed, add it wherever you need to and store a copy somewhere.
5. Press Ctrl+C to stop the discovery.
6. Reconnect to your regular wireless network.
7. Readd the device in the Mi Home app so that it has access to your regular wireless network.
