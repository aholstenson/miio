# Humidifier

* `device.type`: `humidifier`
* **Models**: zhimi-humidifier-v1
* **Model identifiers**: `zhimi-humidifier-v1`

## Basic API

### Properties and sensor values

* `power`, boolean indicating the power state of the device
* `mode`, string indicating the current mode
* `temp_dec`, number indicating the temperature in Celsius
* `humidity`, number indicating the relative humidity in percent
* `led_b`
* `buzzer`
* `child_lock`
* `limit_hum`
* `trans_level`
* `cola`

Example:
return device.call('get_prop', ["cola","humidity","temp_dec","power","mode","led_b","buzzer","child_lock","limit_hum","trans_level"])

### Power

* power is specified as on or off string

Example:
return device.call('set_power', ["on"])

### Modes

The air purifiers have different modes that controls their speed.

* `silent`, lowest speed
* `medium`, medium speed
* `high`, high speed

Example:
return device.call('set_mode', ["medium"])

### Settings

* `device.buzzer` - boolean indicating if the buzzer (beep) is active
* `device.setBuzzer(boolean)` - switch the buzzer on or off
* `device.led` - if the LED is on or off
* `device.setLed(boolean)` - switch the LED on or off
* `device.ledBrightness` - the LED brightness, `bright`, `dim` or `off`
* `device.setLedBrightness(string)` - set the brightness of the LED
* `device.favoriteLevel` - set the speed the device should run at when mode is `favorite`. Between 0 and 16.
* `device.setFavoriteLevel(number)` - set the speed for mode `favorite`
