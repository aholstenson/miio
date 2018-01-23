# Power Outlets

* **Devices**: No outlets currently supported
* **Model identifiers**: No outlets currently supported

The supported models of power outlets are mapped into a [`power-outlet`][power-outlet] with support for [power switching][switchable-power].

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

[power-outlet]: http://abstract-things.readthedocs.io/en/latest/electrical/outlets.html
[sensor]: http://abstract-things.readthedocs.io/en/latest/sensors/index.html
[power]: http://abstract-things.readthedocs.io/en/latest/common/power.html
[switchable-power]: http://abstract-things.readthedocs.io/en/latest/common/switchable-power.html
