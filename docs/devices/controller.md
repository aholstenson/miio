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
* `device.on('action', function)` - listen for all actions
* `device.on('action:<id>', function)` - listen for action with name `<id>`

[actions]: http://abstract-things.readthedocs.io/en/latest/controllers/actions.html
[button]: http://abstract-things.readthedocs.io/en/latest/controllers/buttons.html
[wall-controller]: http://abstract-things.readthedocs.io/en/latest/controllers/wall-controllers.html
[battery-level]: http://abstract-things.readthedocs.io/en/latest/common/battery-level.html
