# Air Purifier

* `device.type`: `air-purifier`
* **Models**: Mi Air Purifier 1 & 2, Pro
* **Model identifiers**: `zhimi.airpurifier.m1`, `zhimi.airpurifier.v1`, `zhimi.airpurifier.v2`, `zhimi.airpurifier.v3`, `zhimi.airpurifier.v6`

## Basic API

### Properties

* `power`, boolean indicating the power state of the device
* `mode`, string indicating the current mode
* `temperature`, number indicating the temperature in Celsius
* `humidity`, number indicating the relative humidity in percent
* `aqi`, number indicating the air quality index (based on PM2.5)

### Power

* `device.power`, read-only boolean indicating if the device is powered on
* `device.setPower(boolean)`, change the power state of the device, returns a promise

### Modes

The air purifiers have different modes that controls their speed.

* `device.mode`, read-only string indicating the current mode
* `device.modes`, read-only array indicating the modes supports by the device
* `device.setMode(string)`, set the current mode of the device, returns a promise

The modes are currently:

* `idle`, turn the device off
* `auto`, set the device to automatic mode where it controls the speed itself
* `silent`, lowest speed, for silent operation or night time
* `low`, low speed
* `medium`, medium speed
* `high`, high speed

### Sensor values

* `device.temperature` - number indicating the temperature in Celsius
* `device.humidity` - number indicating the relative humidity in percent
* `device.aqi` - number indicating the Air Quality Index (based on PM2.5)

### Settings

* `device.buzzer` - boolean indicating if the buzzer (beep) is active
* `device.setBuzzer(boolean)` - switch the buzzer on or off
* `device.led` - if the LED is on or off
* `device.setLed(boolean)` - switch the LED on or off
* `device.ledBrightness` - the LED brightness, `bright`, `dim` or `off`
* `device.setLedBrightness(string)` - set the brightness of the LED
* `device.favoriteLevel` - set the speed the device should run at when mode is `favorite`. Between 0 and 16.
* `device.setFavoriteLevel(number)` - set the speed for mode `favorite`
