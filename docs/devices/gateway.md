# Gateways

* **Devices**: Mi Smart Home Gateway 2 and 3
* **Model identifiers**: `lumi.gateway.v2`, `lumi.gateway.v3`

Support for the Mi Smart Home Gateway that provides access to a set of smaller
devices such as switches, motion detection and temperature and humidity sensors.

**Note** To fully support the gateway this library will automatically enable
the Local Developer API of the gateway. If it is already enabled the existing
key is used but if not a new key is generated and set for the API.

## Examples

### Check if the device is a gateway

```javascript
if(device.matches('type:miio:gateway')) {
  /*
   * This device is a Mi Gateway.
   */
}
```

### Get child devices

```javascript
const children = device.children();
for(const child of children) {
  // Do something with each child
}
```

## API

### Children - [`cap:children`][children]

* `device.children()` - get the children of the gateway. Returns an iterable without going via a promise.
* `device.child(id)` - get a child via its identifier

[children]: http://abstract-things.readthedocs.io/en/latest/common/children.html
