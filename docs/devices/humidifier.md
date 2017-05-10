# Humidifier

* `device.type`: `humidifier`
* **Models**: zhimi-humidifier-v1
* **Model identifiers**: `zhimi-humidifier-v1`

### Properties and sensor values

* `power`
* `mode`
* `temp_dec`
* `humidity`
* `led_b`
* `buzzer`
* `child_lock`
* `limit_hum`
* `trans_level`
* `cola`

Example: return device.call('get_prop', ["cola","humidity","temp_dec","power","mode","led_b","buzzer","child_lock","limit_hum","trans_level"])

### Power

* power is specified as on or off string
Example: return device.call('set_power', ["on"])

### Modes

* `silent`, lowest speed
* `medium`, medium speed
* `high`, high speed

Example: return device.call('set_mode', ["medium"])

### Settings

* `buzzer` - turn the buzzer on or off.
Example: return device.call('set_buzzer', ['on'])
