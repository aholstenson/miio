# Light

* `device.type`: `light`
* **Models**: Mi Yeelight lamps
* **Model identifiers**: `yeelink.light.lamp1`, `yeelink.light.mono1`, `yeelink.light.color1`


## Basic API

### Properties

* `power`, boolean indicating if the light is on or not
* `brightness`, number between 0 and 100 indicating the brightness of the light
* `colorMode`, the color mode of the light, one of `none`, `rgb`, `colorTemperature` or `hsv`

### `device.power(): boolean`

Get if the light is powered on.

### `device.setPower(boolean): Promise`

Switch the light on or off.

### `device.brightness: number`

Get the brightness of the light.

### `device.setBrightness(number): Promise`

Set the brightness of the light.

## Capability: `color:temperature`

If this device supports changing the temperature of the color.

### Properties

* `colorTemperature` - the color temperature in Kelvin

### `device.colorTemperature: number`

Get the current color temperature if the `colorMode` is `colorTemperature`.

### `device.setColorTemperature(number): Promise`

Set the color temperature of this light and switch `colorMode` to `colorTemperature`.
