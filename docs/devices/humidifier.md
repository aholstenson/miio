# Humidifier

* `device.type`: `humidifier`
* **Models**: Mi Humidifier
* **Model identifiers**: `zhimi.humidifier.v1`

### Properties

* `power`, boolean indicating the power state of the device
* `mode`, string indicating the current mode
* `temperature`, number indicating the temperature in Celsius
* `humidity`, number indicating the relative humidity in percent

### Power

* `device.power`, read-only boolean indicating if the device is powered on
* `device.setPower(boolean)`, change the power state of the device, returns a promise

### Modes

The humidifiers have different modes that controls their speed.

* `device.mode`, read-only string indicating the current mode
* `device.modes`, read-only array indicating the modes supports by the device
* `device.setMode(string)`, set the current mode of the device, returns a promise

The modes are currently:

* `silent`, lower speed
* `medium`, medium speed
* `high`, high speed

### Sensor values

* `device.temperature` - number indicating the temperature in Celsius
* `device.humidity` - number indicating the relative humidity in percent
* `device.aqi` - number indicating the Air Quality Index (based on PM2.5)

### Settings

* `device.buzzer` - boolean indicating if the buzzer (beep) is active
* `device.setBuzzer(boolean)` - switch the buzzer on or off
* `device.ledBrightness` - the LED brightness, `bright`, `dim` or `off`
* `device.setLedBrightness(string)` - set the brightness of the LED
