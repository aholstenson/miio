# Power Plugs

* **Devices**: Mi Smart Socket Plug, Aqara Plug
* **Model identifiers**: `chuangmi.plug.v1`, `chuangmi.plug.v2`, `chuangmi.plug.m1`, `lumi.plug`

The supported models of power plugs are mapped into a [`power-plug`][power-plug] with support for [power switching][switchable-power].

## Examples

### Check if device is a power strip

```javascript
if(device.matches('type:power-strip')) {
  /*
   * This device is a power strip.
   */
}
```

### Check if powered on

```javascript
// Get if the outlets on the strip have power
device.power()
  .then(isOn => console.log('Outlet power:', isOn))
  .catch(...);

// Using async/await
console.log('Outlet power:', await device.power());
```

### Power on device

```javascript
// Switch the outlets on
device.setPower(true)
  .then(...)
  .catch(...)

// Switch on via async/await
await device.power(true);
```

## API

### Power - [`cap:power`][power] and [`cap:switchable-power`][switchable-power]

* `device.power()` - get if the outlets currently have power
* `device.power(boolean)` - switch if outlets have power
* `device.setPower(boolean)` - switch if outlets have power
* `device.on(power, isOn => ...)` - listen for power changes

## Models

### Mi Smart Socket Plug (V1) - `chuangmi.plug.v1`

The V1 plug has a USB-outlet that can be controlled individually. It is made
available as a child that implements [power switching][switchable-power]:

```javascript
const usbOutlet = light.child('usb');

const isOn = await usbOutlet.power();
```

[power-plug]: http://abstract-things.readthedocs.io/en/latest/electrical/plugs.html
[sensor]: http://abstract-things.readthedocs.io/en/latest/sensors/index.html
[power]: http://abstract-things.readthedocs.io/en/latest/common/power.html
[switchable-power]: http://abstract-things.readthedocs.io/en/latest/common/switchable-power.html
