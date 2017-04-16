# Switch

* `device.type`: `controller`
* **Models**: Aqara Switch, Aqara Cube, Aqara Light Switch
* **Model identifiers**: `lumi.switch`, `lumi.cube`

The controller type is used for anything that used primarily for controlling
something else. It's primary function is that it emits an event named `action`
when someone interacts with the device.

```javascript
device.on('action', action => /* do something useful */);
```

## Basic API

### Event: `action`

Emitted when a certain action is performed on the device, such as it is clicked
or flipped or whatever is supported by the device.

Example payloads:

```javascript
{
	id: 'click'
}
```

```javascript
{
	id: 'rotate',
	amount: -28
}
```

### `device.actions: Array[string]`

Get the actions supported by the device.
