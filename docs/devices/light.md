# Lights

* **Devices**: Mi Yeelight Lamps, Philiphs Bulb, Philiphs Eye Care lamp
* **Model identifiers**: `yeelink.light.lamp1`, `yeelink.light.mono1`, `yeelink.light.color1`, `yeelink.light.strip1`, `philips.light.sread1`, `philips.light.bulb`

Lights are turned into devices of type [light][light] and by default support
[power switching][switchable-power] and [dimming][dimmable]. Depending on the
model the light might [support color][colorable] and [fading][fading].

## Examples

### Check if device is a light

```javascript
if(device.matches('type:light')) {
  /*
   * This device is a light.
   */
}
```

### Check if powered on

```javascript
// Get if the light is on
device.power()
  .then(isOn => console.log('Light on:', isOn))
  .catch(...);

// Using async/await
console.log('Light on:', await device.power());
```

### Power on light

```javascript
// Switch the light on
device.setPower(true)
  .then(...)
  .catch(...)

// Switch on via async/await
await device.power(true);
```

### Read current brightness

```javascript
// Read the current brightness
device.brightness()
  .then(b => console.log('Brightness:', b))
  .catch(...);

// Using async/await
console.log('Brightness:', await device.brightness());
```

### Change the brightness

```javascript
// Set the brightness
device.setBrightness(50)
  .then(...)
  .catch(...);

// Using async/await
await device.setBrightness(50);

// Increase the brightness by 20%
await device.increaseBrightness(20);

// Decrease the brightness by 20%
await device.decreaseBrightness(20);
```

### Check if color is supported

```javascript
if(device.matches('cap:colorable')) {
  // Light supports setting color
}

if(device.matches('cap:colorable', 'cap:color:full')) {
  // Light supports setting full range of colors
}

if(device.matches('cap:colorable', 'cap:color:temperature')) {
  // Light supports color temperatures
}
```

## API

### Power - [`cap:power`][power] and [`cap:switchable-power`][switchable-power]

* `device.power()` - get if the light is turned on
* `device.power(boolean)` - switch the light on or off
* `device.setPower(boolean)` - switch the light on or off
* `device.on('powerChanged', isOn => ...)` - listen for power changes

### Brightness - [`cap:brightness`][brightness] and [`cap:dimmable`][dimmable]

* `device.brightness()` - get the brightness of the light
* `device.brightness(percentage, duration)` - set the brightness of the light
* `device.setBrightness(percentage, duration)` - set the brightness of the light
* `device.increaseBrightness(percentage, duration)` - increase the brightness of the light
* `device.decreaseBrightness(percentage, duration)` - decrease the brightness of the light
* `device.on('brightnessChanged', bri => ...)` - listen for changes in brightness

### Color - [`cap:colorable`][colorable]

* `device.color()` - get the current color of the light
* `device.color(color, duration)` - update the color of the light, color can be hex-values, Kelvin-values, see capability docs for details
* `device.on('colorChanged', color => ...)` - listen for changes to color

### Fading - [`cap:fading`][fading]

Supported by Yeelights. Indicates that the `duration` parameter works.

## Models

### Philiphs Eye Care Lamp - `philips.light.sread1`

The Eye Care lamp provides a child device to control the ambient light. This
ambient light implements [power switching][switchable-power] and
[dimming][dimmable]:

```javascript
const ambientLight = light.child('ambient');

const isOn = await ambientLight.power();
```

[light]: http://abstract-things.readthedocs.io/en/latest/lights/index.html
[sensor]: http://abstract-things.readthedocs.io/en/latest/sensors/index.html
[power]: http://abstract-things.readthedocs.io/en/latest/common/power.html
[switchable-power]: http://abstract-things.readthedocs.io/en/latest/common/switchable-power.html
[brightness]: http://abstract-things.readthedocs.io/en/latest/lights/brightness.html
[dimmable]: http://abstract-things.readthedocs.io/en/latest/lights/dimmable.html
[colorable]: http://abstract-things.readthedocs.io/en/latest/lights/colorable.html
[fading]: http://abstract-things.readthedocs.io/en/latest/lights/fading.html
