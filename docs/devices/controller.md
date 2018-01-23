# Controllers

* **Devices**: Aqara Switch (round and square), Aqara Light Switch, Aqara Dual Light Switch
* **Model identifiers**: `lumi.switch`, `lumi.switch.aq2`, `lumi.86sw1`, `lumi.86sw2`

Controllers are devices whose primary function is to control something else.
These devices will have the capability [`actions`][actions] and their primary
function will be emitting events. Single button switches will be of the type
[`button`][button] and other switches are translated into the type 
[`wall-controller`][wall-controller]. Controllers may also have the capability
[`battery-level`][battery-level] if they can report their battery level.

## Examples

### Check if device supports actions

```javascript
if(device.matches('cap:actions')) {
  /*
   * This device is a controller of some sort.
   */
}
```

### Listen for actions

```javascript
device.on('action', event => console.log('Action', event.action, 'with data', event.data));

device.on('action:idOfAction', data => ...);
```

### List available actions

```javascript
// Get the available actions
device.actions()
  .then(actions => ...)
  .catch(...);

// Using async/await
const actions = await device.actions();
```

## API

### Actions - [`cap:actions`][actions]

* `device.actions()` - get all of the available actions
* `device.on('action', event => ...)` - listen for all actions
* `device.on('action:<id>', data => ...)` - listen for action with name `<id>`

## Models

### Aqara Button V1 - `lumi.switch`

Round button connected to a Mi Gateway. Supports the actions `click`, 
`double_click`, `long_click_press` and `long_click_release`.

### Aqara Button V2 - `lumi.switch.v2`

Square button connected to a Mi Gateway. Supports the actions `click`
and `double_click`.

### Aqara Cube - `lumi.cube`

Cube connected to a Mi Gateway. Supports the actions `alert`, `flip90`,
`flip180`, `move`, `tap_twice`, `shake_air`, `free_fall` and `rotate`.

When the action is `rotate` the data in the event will be an object including
the key `amount`. Example use:

```javascript
device.on('action:rotate', data => console.log('Rotation amount:', data.amount));
```

### Aqara Wall Switch, one button - `lumi.86sw1`

Wall Switch with one button. Supports the actions: `click` and `double_click`

### Aqara Wall Switch, two buttons - `lumi.86sw2`

Wall Switch with two buttons. Suppors the actions `btn0-click`,
`btn0-double_click`, `btn1-click`, `btn1-double_click` and `both_click`.

[actions]: http://abstract-things.readthedocs.io/en/latest/controllers/actions.html
[button]: http://abstract-things.readthedocs.io/en/latest/controllers/buttons.html
[wall-controller]: http://abstract-things.readthedocs.io/en/latest/controllers/wall-controllers.html
[battery-level]: http://abstract-things.readthedocs.io/en/latest/common/battery-level.html
