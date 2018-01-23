# Wall Switches

* **Devices**: Aqara Light Control (Wall Switch)
* **Model identifiers**: `lumi.ctrl_neutral1`, `lumi.ctrl_neutral2`, `lumi.ctrl_ln1`, `lumi.ctrl_ln2`

The supported models of power strips are mapped into a [`wall-switch`][wall-switch] where individual channels are available as child devices. The
child devices are [lights][light] with support for
[power switching][switchable-power].

## Examples

### Check if device is a wall switch

```javascript
if(device.matches('type:wall-switch')) {
  /*
   * This device is a wall switch.
   */
}
```

## Get a light channel

```javascript
const light0 = device.child('0');

// For some devices
const light1 = device.child('1');
```

## Toggle power a light channel

```javascript
const light0 = device.child('0');

// Change power to on
light0.power(true)
  .then(...)
  .catch(...);

// With async/await
await light0.power(true);
```

## API

### Access individual power channels

* `device.

## Child API

### Power - [`cap:power`][power] and [`cap:switchable-power`][switchable-power]

* `device.power()` - get if the air purifier is currently active
* `device.power(boolean)` - switch the air purifier on, returns a promise
* `device.setPower(boolean)` - change the power state of the device, returns a promise
* `device.on(power, isOn => ...)` - listen for power changes

[wall-switch]: http://abstract-things.readthedocs.io/en/latest/electrical/wall-switches.html
[power]: http://abstract-things.readthedocs.io/en/latest/common/power.html
[switchable-power]: http://abstract-things.readthedocs.io/en/latest/common/switchable-power.html
