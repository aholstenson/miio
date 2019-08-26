# Development Notes for XiaoMi Fan

## Variants

1. [米家直流变频落地扇](https://item.mi.com/1182100014.html)
2. [米家直流变频落地扇 1x](https://www.mi.com/airfan1x/)
3. [智米直流变频落地扇 2 有线版](https://www.xiaomiyoupin.com/detail?gid=105764)
4. [智米直流变频落地扇 2s 无线版](https://www.xiaomiyoupin.com/detail?gid=105764)

## Feature Comparison

.| 米家直流变频落地扇 | 米家直流变频落地扇 1x | 智米直流变频落地扇 2 有线版 | 智米直流变频落地扇 2s 无线版
-|-|-|-|-|
Model No. | ZLBPLDS012ZM | BPLDS01DM | a| b|
Identifier |zhimi.fan.sa1 | dmaker.fan.p5 | zhimi.fan.za3 | zhimi.fan.za4 |
Price|299RMB|279RMB|399RMB|599RMB
Nature Wind|:white_check_mark:|:white_check_mark:|:white_check_mark:|:white_check_mark:|
Max Oscillation Range| 120º | 140º |120º |120º |
Min Noise Level| 33 dB(A)| 26.6 dB(A) | 28.6 dB(A) |28.6 dB(A) |
Fan Speed| 100 档|100 档|100 档|100 档|
Battery | :x: |:x: |:x: | 33.6 Wh Li-ion Battery
Weight | 3 kg| 2.8 kg| 3.2 kg | 3.5 kg
Dimension | 340×330×960mm | 343×330×950mm | 340×330×960mm | 340×330×960mm |

## Basic Configuration

Property | Allowed Values
-|-
Power | on / off
WindMode | nature / normal
Fan Speed | [1-100]%
Oscillation | on / off
Oscillation Range | 30º, 60º, 90º, 120º (allow customization of upper-limit)
Schedule Power Off | [1-8] measured in hours
Indicator Light | on / off
Buzzer | on / off
Child lock | on / off

> WindMode, Oscillation, Schedule Power Off, Child Lock require new capabilities, currently not defined.

## Special Configuration

- each model define a `static type() => model`
- for DmakerFan, change upper limit of Oscillation Range to 140º
- for ZhiMiDCVariableFrequencyFan, add Battery Level property

## Questions

- When do we need to define api?
- two main kinds of function to define in our type definition:

  1. Ones that deal with in memory representation of the device
  2. Ones that actually interacts with the device
  3. use `propertyUpdated(key, value)` to update the in momery representation
  4. define custome methods to interact with the device

- `miio` adopted `abstract-things` as basis beginning with version 15.0

you can define your custome type by using the following syntax:

```javascript
// import the capabilities you need
const Buzzer = require('./capabilities/buzzer');

// then
module.exports = Thing.type(Parent => class MiFan extends Parent.with(Buzzer){
    static type() {
      return 'miio:mifan';
    }

    constructor(options) {
        super(options);

        this.defineProperty('power', {
            name: 'power',
            mapper: v => v === 'on'
      });
    }
});
```

> - `Thing` is the base type, use `with()` to combine >= 1 functionalities on top of this base type
> - Anything defined using syntax similar to the one shown above can be used inside `with()`. That means they can be used to extend functionalities to form new Thing
> - `property.mapper` is used to convert input to an accepted value by the actual device

- In order to use the public API declared in `lib/device.js`, you need to do the following:

```javascript
const MiioApi = require('miio/device');
```

then wherever you want to communicate with the physical device, do the following

```js
this.MiioApi.call('get_prop', ["all"], {
  refresh: ["all"]
});
```

based on `call(method, args, options)` in `lib/device.js`

`options.refresh` is used to read the property from the physical device after the change

this function returns a Promise, the following code snippet from `yeelight.js` demonstrate how to use this.

```js
changePower(power) {
  // TODO: Support for duration
  return this.call(
  	'set_power',
  	Yeelight.withEffect(power ? 'on' : 'off'),
  	{
  		refresh: [ 'power']
  	}
  ).then(MiioApi.checkOk);
}
```

## Methods Available

This document lists all the raw methods and their accepted parameter values. You can test these methods by using the following **[miio](https://github.com/aholstenson/miio)** commands

```shell
miio tokens update device_ip --token device_token

miio protocol call device_ip method_name '["parameter"]'
miio protocol call device_ip get_prop '["spped"]'
miio protocol call device_ip s_angle '[90]'
miio protocol call device_ip s_roll '[true]'
```

## 米家直流变频落地扇 1x `dmaker.fan.p5`

- **get_prop**
  - *buzzer*
    this one need more research, using buzzer returns all the properties, which means this is not the correct property name for buzzer used by the physical device
  - *child_lock*
  - *light*
  - *mode*
  - *power*
  - *poweroff_time*
  - *roll_angle*
  - *roll_enable*
  - *speed*

| Method      | Parameter |
|------------|---------|
| **s_mode** | "nature" / "normal" |
| **s_speed** | an Int in [1-100] |
| **s_light** | true / false |
| **s_lock** | true / false |
| **s_power** | true / false |
| **s_roll** | true / false |
| **s_sound** | true / false |
| **s_angle** | an Int in [30, 60, 90, 120, 140] |
| **s_t_off** | 3600 * [0-8] |

> **s_t_off**
> Schedule Poweroff

## 米家直流变频落地扇 `zhimi.fan.sa1`

- **get_prop**
  - *angle_enable*
  - *angle*
  - *buzzer*
  - *child_lock*
  - *led_b*
  - *natural_level*
  - *power*
  - *poweroff_time*
  - *speed_level*

| Method      | Parameter |
|------------|---------|
| **set_angle** | an Int in [30, 60, 90, 120] |
| **set_angle_enable** |  on/off |
| **set_child_lock** |  on/off |
| **set_power** |  on/off |
| **set_speed_level** | 0 ~ 100 |
| **set_natural_level** | 0 ~ 100 |
| **set_buzzer** | 0 (off) / 2 (on) |
| **set_led_b** | 0 (Bright) / 1 (Dim) / 2 (Off) |
| **set_poweroff_time** | 3600 x [0-8] |
| **set_move** | right / left |

> **set_move**
> move in the chosen direction by 5 degree

## 智米直流变频落地扇 2 有线版 `zhimi.fan.za3`

- **get_prop**
  - *angle_enable*
  - *buzzer*
  - *child_lock*
  - *led_b*
  - *natural_level*
  - *ac_power*
  - *speed_level*

| Method      | Parameter |
|------------|---------|

## 智米直流变频落地扇 2s 无线版 `zhimi.fan.za4`

- **get_prop**
  - *angle*
  - *angle_enable*
  - *buzzer*
  - *child_lock*
  - *led_b*
  - *natural_level*
  - *power*
  - *poweroff_time*
  - *speed_level*

| Method      | Parameter |
|------------|---------|
| **set_angle** | an Int in [30, 60, 90, 120] |
| **set_angle_enable** | on/off |
| **set_buzzer** | on/off |
| **set_child_lock** | on/off |
| **set_power** | on/off |
| **set_led_b** | 0 (Bright) / 1 (Dim) / 2 (Off) |
| **set_move** | right / left |
| **set_natural_level** | 0 ~ 100 |
| **set_poweroff_time** | 3600 x [0-8] |
| **set_speed_level** | 0 ~ 100 |

> counter-clockwise is natural mode

## 1st func to overwrite: **loadProperties(props)**

this function fetches the properties from the physical device, the return value is a dictionary of 'key: value'

For MiFan, because its **get_prop** method only takes **"all"** as parameter. I only did packet sniffing with **DmakerFan (米家直流变频落地扇 1x)**. Need to confirm for the other models

Judging by the definition of *loadProperties(props)*, *call(method, props)* only returns the result value from the device response of *method*. *loadProperties(props)* does the key value pairing by itself.

So we just need overwrite this function, apply customization of the key value pairing process.

1. an array containing the keys that corresponds to the values in result in order of appearance

2. map the passed-in props to their position index in this array

3. for each requested prop, pair it with the value in result based on the position index

4. return the result

## Property Definition for MiFan

Because MiFan behaves differently than other devices, its `get_prop` method only takes `[["all"]]` as the parameter.

For other devices, this method takes the corresponding keys for each one of their properties. Take Yeelight for example, its `get_prop` method accepts any of the 4 parameters: ["power", "bright", "cct", "snm" "dv"]

Although for both MiFan and other devices, the returned results are just an array of values with no label.

So you can choose any names to use for the properties.

property mapper is for converting the property of in-memory representation to a value the physical device accepts as input
