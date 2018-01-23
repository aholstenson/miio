# Air Purifier

* **Devices**: Mi Air Purifier 1 & 2, Pro
* **Model identifiers**: `zhimi.airpurifier.m1`, `zhimi.airpurifier.v1`, `zhimi.airpurifier.v2`, `zhimi.airpurifier.v3`, `zhimi.airpurifier.v6`

Air purifiers are turned into devices of type [air-purifier][air-purifier]
and by default support [power switching][switchable-power] and [setting their mode][switchable-mode]. The Mi Air
Purifiers are also [sensors][sensor] and can report the [PM2.5 (air quality index)][pm2.5],
[temperature][temp] and [relative humidity][humidity] where they are placed.

## Examples

### Check if device is an air purifier

```javascript
if(device.matches('type:air-purifier')) {
  /*
   * This device is an air purifier.
   */
}
```

### Check if powered on

```javascript
// Get if the air purifier is on
device.power()
  .then(isOn => console.log('Air purifier on:', isOn))
  .catch(...);

// Using async/await
console.log('Air purifier on:', await device.power());
```

### Power on device

```javascript
// Switch the air purifier on
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

* `device.power()` - get if the air purifier is currently active
* `device.power(boolean)` - switch the air purifier on, returns a promise
* `device.setPower(boolean)` - change the power state of the device, returns a promise
* `device.on(power, isOn => ...)` - listen for power changes

### Mode - [`cap:mode`][mode] and [`cap:switchable-mode`][switchable-mode]

The air purifiers have different modes that controls their speed.

* `device.mode()` - get the current mode
* `device.mode(string)` - set the current mode of the device, returns a promise
* `device.setMode(string)` - set the current mode of the device, returns a promise
* `device.modes()` - read-only array indicating the modes supports by the device
* `device.on('modeChanged', mode => ...)` - listen for changes to the current mode

The modes supported change between different models, but most devices support:

* `idle`, turn the device off
* `auto`, set the device to automatic mode where it controls the speed itself
* `silent`, lowest speed, for silent operation or night time
* `favorite`, favorite level

### Sensor - [`type:sensor`][sensor]

* `device.temperature()` - get the current temperature, see [`cap:temperature`][temp] for details
* `device.on('temperature', temp => ...)` - listen to changes to the read temperature
* `device.relativeHumidity()` - get the current relative humidity, see [`cap:relative-humidity`][humidity] for details
* `device.on('relativeHumidityChanged', rh => ...)` - listen to changes to the relative humidity
* `device.pm2_5` - get the current PM2.5 (Air Quality Index), see [`cap:pm2.5`][pm2.5] for details
* `device.on('pm2.5Changed', pm2_5 => ...)` - listen to changes to the PM2.5 value

### Buzzer settings - `cap:miio:buzzer`

* `device.buzzer()` - boolean indicating if the buzzer (beep) is active
* `device.buzzer(boolean)` - switch the buzzer on or off
* `device.setBuzzer(boolean)` - switch the buzzer on or off

### LED settings - `cap:miio:switchable-led`

Turn the LED indicator on the device on or off.

* `device.led()` - if the LED is on or off
* `device.led(boolean)` - switch the LED on or off

### LED brightness - `cap:miio:led-brightness`

Change the brightness of the LED on the device.

* `device.ledBrightness()` - the LED brightness, `bright`, `dim` or `off`
* `device.ledBrightness(string)` - set the brightness of the LED

### Other

* `device.favoriteLevel()` - get the speed the device should run at when mode is `favorite`. Between 0 and 16.
* `device.favoriteLevel(level)` - set the speed the device should run at when mode is `favorite`. Between 0 and 16.
* `device.setFavoriteLevel(number)` - set the speed for mode `favorite`

[air-purifier]: http://abstract-things.readthedocs.io/en/latest/climate/air-purifiers.html
[sensor]: http://abstract-things.readthedocs.io/en/latest/sensors/index.html
[power]: http://abstract-things.readthedocs.io/en/latest/common/power.html
[switchable-power]: http://abstract-things.readthedocs.io/en/latest/common/switchable-power.html
[mode]: http://abstract-things.readthedocs.io/en/latest/common/mode.html
[switchable-mode]: http://abstract-things.readthedocs.io/en/latest/common/switchable-mode.html
[pm2.5]: http://abstract-things.readthedocs.io/en/latest/sensors/pm2.5.html
[temp]: http://abstract-things.readthedocs.io/en/latest/sensors/temperature.html
[humidity]: http://abstract-things.readthedocs.io/en/latest/sensors/relative-humidity.html
