# Humidifier

* **Devices**: Mi Humidifier
* **Model identifiers**: `zzhimi.humidifier.v1`

Humidifiers are turned into devices of type [humidifer][humidifier]
and by default support [power switching][switchable-power] and 
[setting their mode][switchable-mode]. The Mi Humidifier are also
[sensors][sensor] and can report the [temperature][temp] and
[relative humidity][humidity] of where they are placed.

Example use:

```javascript
if(device.matches('type:humidifier')) {
  /*
   * This device is a humidifier.
   */

  // Get if the humidifier is on
  console.log('Humidifier is on:', device.power());

  // Switch the humidifier on
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

* `device.power()`, get if the air purifier is currently active
* `device.power(boolean)`, switch the air purifier on, returns a promise
* `device.setPower(boolean)`, change the power state of the device, returns a promise

### Mode - [`cap:mode`][mode] and [`cap:switchable-mode`][switchable-mode]

The air purifiers have different modes that controls their speed.

* `device.mode()` - get the current mode
* `device.modes` - read-only array indicating the modes supports by the device
* `device.mode(string)` - set the current mode of the device, returns a promise
* `device.setMode(string)` - set the current mode of the device, returns a promise

The modes supported change between different models, but most devices support:

* `idle`, turn the device off
* `silent`, silent mode, lowest speed
* `medium`, medium speed
* `hight`, high speed

### Sensor - [`type:sensor`][sensor]

* `device.temperature` - get the current temperature, see [`cap:temperature`][temp] for details
* `device.relativeHumidity` - get the current relative humidity, see [`cap:relative-humidity`][humidity] for details

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
