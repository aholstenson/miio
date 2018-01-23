# Air Purifier

* **Devices**: Mi Air Purifier 1 & 2, Pro
* **Model identifiers**: `zhimi.airpurifier.m1`, `zhimi.airpurifier.v1`, `zhimi.airpurifier.v2`, `zhimi.airpurifier.v3`, `zhimi.airpurifier.v6`

Air purifiers are turned into devices of type [air-purifier][air-purifier]
and by default support [power switching][switchable-power] and [setting their mode][switchable-mode]. The Mi Air
Purifiers are also [sensors][sensor] and can report the [PM2.5 (air quality index)][pm2.5],
[temperature][temp] and [relative humidity][humidity] where they are placed.

Example use:

```javascript
if(device.matches('type:air-purifier')) {
  /*
   * This device is an air purifier. In miio it will support power
   * switching, modes and reading of sensor values.
   */

  // Get if the air purifier is on
  console.log('Air purifier is on:', device.power);

  // Switch the air purifier on
  device.setPower(true)
    .then(...)
    .catch(...)

  // Get the current temperature
  console.log(device.temperature);

  // Get the current PM2.5 value
  console.log(device.pm2_5);
}
```

## API

### Power - [`cap:power`][power] and [`cap:switchable-power`][switchable-power]

* `device.power`, get if the air purifier is currently active
* `device.setPower(boolean)`, change the power state of the device, returns a promise

### Mode - [`cap:mode`][mode] and [`cap:switchable-mode`][switchable-mode]

The air purifiers have different modes that controls their speed.

* `device.mode` - get the current mode
* `device.modes` - read-only array indicating the modes supports by the device
* `device.setMode(string)` - set the current mode of the device, returns a promise

The modes supported change between different models, but most devices support:

* `idle`, turn the device off
* `auto`, set the device to automatic mode where it controls the speed itself
* `silent`, lowest speed, for silent operation or night time
* `favorite`, favorite level

### Sensor - [`type:sensor`][sensor]

* `device.temperature` - get the current temperature, see [`cap:temperature`][temp] for details
* `device.relativeHumidity` - get the current relative humidity, see [`cap:relative-humidity`][humidity] for details
* `device.pm2_5` - get the current PM2.5 (Air Quality Index), see [`cap:pm2.5`][pm2.5] for details

### Buzzer settings - `cap:miio:buzzer`

* `device.buzzer` - boolean indicating if the buzzer (beep) is active
* `device.setBuzzer(boolean)` - switch the buzzer on or off

### LED settings - `cap:miio:switchable-led`

Turn the LED indicator on the device on or off.

* `device.led` - if the LED is on or off
* `device.setLed(boolean)` - switch the LED on or off

### LED brightness - `cap:miio:led-brightness`

Change the brightness of the LED on the device.

* `device.ledBrightness` - the LED brightness, `bright`, `dim` or `off`
* `device.setLedBrightness(string)` - set the brightness of the LED

### Other

* `device.favoriteLevel` - set the speed the device should run at when mode is `favorite`. Between 0 and 16.
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
