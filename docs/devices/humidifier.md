# Humidifier

* **Devices**: Mi Humidifier
* **Model identifiers**: `zhimi.humidifier.v1`

Humidifiers are turned into devices of type [humidifer][humidifier]
and by default support [power switching][switchable-power] and 
[setting their mode][switchable-mode]. The Mi Humidifier are also
[sensors][sensor] and can report the [temperature][temp] and
[relative humidity][humidity] of where they are placed.

## Examples

### Check if device is a humidifier

```javascript
if(device.matches('type:humidifier')) {
  /*
   * This device is a humidifier.
   */
}
```

### Check if powered on

```javascript
// Get if the humidifier is on
device.power()
  .then(isOn => console.log('Humidifier on:', isOn))
  .catch(...);

// Using async/await
console.log('Humidifier on:', await device.power());
```

### Power on device

```javascript
// Switch the humidifier on
device.setPower(true)
  .then(...)
  .catch(...)

// Switch on via async/await
await device.power(true);
```

### Read temperature

```javascript
// Read the temperature
device.temperature()
  .then(temp => console.log('Temperature:', temp.celsius))
  .catch(...);

// Using async/await
const temp = await device.temperature();
console.log('Temperature:', temp.celsius);
```

### Read humidity

```javascript
// Read the relative humidity
device.relativeHumidity()
  .then(rh => console.log('Relative humidity:', rh))
  .catch(...);

// Using async/await
const rh = await device.relativeHumidity();
console.log('Relative humidity:', rh);
```

## API

### Power - [`cap:power`][power] and [`cap:switchable-power`][switchable-power]

* `device.power()` - get if the humidifier is currently active
* `device.power(boolean)` - switch the humidifer is on, returns a promise
* `device.setPower(boolean)` - change the power state of the device, returns a promise
* `device.on('powerChanged', isOn => ...)` - listen for power changes

### Mode - [`cap:mode`][mode] and [`cap:switchable-mode`][switchable-mode]

The air purifiers have different modes that controls their speed.

* `device.mode()` - get the current mode
* `device.mode(string)` - set the current mode of the device, returns a promise
* `device.setMode(string)` - set the current mode of the device, returns a promise
* `device.modes()` - read-only array indicating the modes supports by the device
* `device.on('modeChanged', mode => ...)` - listen for changes to the current mode

The modes supported change between different models, but most devices support:

* `idle`, turn the device off
* `silent`, silent mode, lowest speed
* `medium`, medium speed
* `hight`, high speed

### Sensor - [`type:sensor`][sensor]

* `device.temperature()` - get the current temperature, see [`cap:temperature`][temp] for details
* `device.on('temperature', temp => ...)` - listen to changes to the read temperature
* `device.relativeHumidity()` - get the current relative humidity, see [`cap:relative-humidity`][humidity] for details
* `device.on('relativeHumidityChanged', rh => ...)` - listen to changes to the relative humidity

### Target humidity - [`cap:target-humidity`][target-humidity] and [`cap:adjustable-target-humidity`][adjustable-target-humidity]

* `device.targetHumidity()` - get the current target humidity
* `device.targetHumidity(target)` - set the target humidity
* `device.on('targetHumidityChanged', th => ...)` - listen to changes to the target humidity

### Buzzer settings - `cap:miio:buzzer`

* `device.buzzer()` - boolean indicating if the buzzer (beep) is active
* `device.buzzer(boolean)` - switch the buzzer on or off
* `device.setBuzzer(boolean)` - switch the buzzer on or off

### LED brightness - `cap:miio:led-brightness`

Change the brightness of the LED on the device.

* `device.ledBrightness()` - the LED brightness, `bright`, `dim` or `off`
* `device.ledBrightness(string)` - set the brightness of the LED

[air-purifier]: http://abstract-things.readthedocs.io/en/latest/climate/air-purifiers.html
[sensor]: http://abstract-things.readthedocs.io/en/latest/sensors/index.html
[power]: http://abstract-things.readthedocs.io/en/latest/common/power.html
[switchable-power]: http://abstract-things.readthedocs.io/en/latest/common/switchable-power.html
[mode]: http://abstract-things.readthedocs.io/en/latest/common/mode.html
[switchable-mode]: http://abstract-things.readthedocs.io/en/latest/common/switchable-mode.html
[pm2.5]: http://abstract-things.readthedocs.io/en/latest/sensors/pm2.5.html
[temp]: http://abstract-things.readthedocs.io/en/latest/sensors/temperature.html
[humidity]: http://abstract-things.readthedocs.io/en/latest/sensors/relative-humidity.html
[target-humidity]: http://abstract-things.readthedocs.io/en/latest/climate/target-humidity.html
[adjustable-target-humidity]: http://abstract-things.readthedocs.io/en/latest/climate/adjustable-target-humidity.html
