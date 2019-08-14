# Development Notes for XiaoMi Fan

## Variants

1. [米家直流变频落地扇](https://item.mi.com/1182100014.html)
2. [米家直流变频落地扇 1x](https://www.mi.com/airfan1x/)
3. [智米直流变频落地扇 2 有线版](https://www.xiaomiyoupin.com/detail?gid=105764)
4. [智米直流变频落地扇 2s 无线版](https://www.xiaomiyoupin.com/detail?gid=105764)

## Feature Comparison

.| 米家直流变频落地扇 | 米家直流变频落地扇 1x | 智米直流变频落地扇 2 有线版 | 智米直流变频落地扇 2s 无线版
-|-|-|-|-|
Model|MiDCVariableFrequencyFan | DmakerFan | ZhiMiNaturalWindFan | ZhiMiDCVariableFrequencyFan
Model No. | ZLBPLDS012ZM | BPLDS01DM | a| b|
Identifier |zhimi.fan.sa1 | dmaker.fan.p5 | | |
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

### 米家直流变频落地扇 1x (Dmaker Fan)

`Model Identifier:` *`dmaker.fan.p5`*

Method | Description | Parameters | Result |
-| -| -|-|-
s_power | turn on / off the device | true / false | "ok"|
s_mode | change windMode | "nature" / "normal" | "ok"|
s_speed | change fanSpeed | an Int in [1-100] | "ok"|
s_roll | whether or not the head should swing | true / false | "ok"|
s_angle | the range of head swing | an Int in [30, 60, 90, 120, 140] | "ok"|
s_t_off | setting scheduled power off | [0, 60, 120,180, 240, 300, 360, 420, 480] as in 60 * [0-8] | "ok"|
s_light | whether the LED indicator lights are turned on | true / false | "ok"|
s_sound | whether the device should buzz when changing a setting | true / false | "ok"|
s_lock | whether the device can be controlled using the physical button | true / false | "ok"|

> Result from `get_prop '[["all"]]'`

After updating the token for the device, try

`miio protocol call 10.0.1.13 get_prop '[["all"]]'`

result is a simple array with no label for each value

```json
[
  false,
  "normal",
  55,
  true,
  140,
  0,
  false,
  true,
  false,
  2
]
```

After some testing, we can determine what each value means and their corresponding internal property names, except 'buzzer' and the last one.

```json
{
  "power": false,
  "mode": "normal",
  "speed": 55,
  "roll_enable": true,
  "roll_angle": 140,
  "poweroff_time": 0,
  "light": false,
  "buzzer": true,
  "child_lock": false
  "?": 2
}
```

### 智米直流变频落地扇 2 有线版 (ZhiMiNaturalWindFan)

`Model Identifier:` *`zhimi.fan.sa1`*

Method | Description | Parameters | Result |
-| -| -| -|
set_angle | the range of head swing | 90 | "ok"|
set_angle_enable | whether or not the head should swing| off / on | "ok"|
set_power |turn on / off the device | 0ff / on | "ok"|
set_speed_level | change fanSpeed | 65| "ok"|
set_natural_level | change fanSpeed | 74| "ok"|
set_buzzer | whether the device should buzz when changing a setting| 0 (off) / 2 (on) | "ok"|
set_led_b |whether the LED indicator lights are turned on | 0 (Bright) / 1 (Dim) / 2 (Off) | "ok"|
set_poweroff_time | setting scheduled power off| 8100 | "ok"|
set_child_lock | whether the device can be controlled using the physical button| off | "ok"|
set_move | setting the swing direction | right / left | "ok"|

> get_prop

```js
[
  "angle",
  "angle_enable",
  "power",
  "speed_level",
  "natural_level",
  "buzzer",
  "led_b",
  "poweroff_time",
  "child_lock"
]
```

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
