# Sensor

* `device.type`: `switch`
* **Models**: Aqara Temperature and Humidity Sensor
* **Model identifiers**: `lumi.sensor_ht`

The sensor type is used for things that are primarily a sensor. The capabilities
described below can be used without the type being `sensor` in which case the
device will instead be marked with `sensor` as a capability.

## Basic API

None.

## Capability: `temperature`

For when the device supports measuring the temperature.

### Properties

* `temperature` - temperature in degrees Celsius

### `device.temperature: number`

Get the temperature in degrees Celsius.

## Capability: `humidity`

For when the device supports measuring the relative humidity.

### Properties

* `humidity` - relative humidity in percent between 0 and 100

### `device.humidity: number`

Get the relative humidity in percent between 0 and 100

## Capability: `aqi`

For when the device supports measuring the air quality. Most Mi Home
products uses tha name `aqi` internally but seems to measure PM2.5.

### Properties

* `aqi` - Air Quality Index number

### `device.aqi: number`

Get the current Air Quality Index

## Capability: `illuminance`

For when the device supports measuring illuminance in Lux.

### Properties

* `illuminance` - the current illuminance in Lux

### `device.illuminance: number`

Get the current illuminance in Lux

## Capability: `pressure`

For when the device supports measuring the atmospheric pressure.

### Properties

* `pressure` - Atmospheric pressure

### `device.pressure: number`

Get the current atmospheric pressure in kPa
