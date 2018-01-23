# Power Strips

* **Devices**: Mi Smart Power Strip
* **Model identifiers**: `qmi.powerstrip.v1`, `zimi.powerstrip.v2`

The two supported models of power strips are mapped into a [`power-strip`][power-strip] with support for [power switching][switchable-power].

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

### Mode - [`cap:mode`][mode] and [`cap:switchable-mode`][switchable-mode]

Power strips may support setting a certain mode, such as a special green mode.

* `device.mode()` - get the current mode
* `device.mode(string)` - set the current mode of the device, returns a promise
* `device.setMode(string)` - set the current mode of the device, returns a promise
* `device.modes()` - read-only array indicating the modes supports by the device
* `device.on('modeChanged', mode => ...)` - listen for changes to the current mode

The modes supported change between different models, but most devices support:

* `green`, green mode
* `normal`, normal mode

[power-strip]: http://abstract-things.readthedocs.io/en/latest/electrical/strips.html
[sensor]: http://abstract-things.readthedocs.io/en/latest/sensors/index.html
[power]: http://abstract-things.readthedocs.io/en/latest/common/power.html
[switchable-power]: http://abstract-things.readthedocs.io/en/latest/common/switchable-power.html
[mode]: http://abstract-things.readthedocs.io/en/latest/common/mode.html
[switchable-mode]: http://abstract-things.readthedocs.io/en/latest/common/switchable-mode.html
