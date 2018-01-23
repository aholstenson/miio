# Robot Vacuums

* **Devices**: Mi Robot Vacuum
* **Model identifiers**: `rockrobo.vacuum.v1`

Robot vacuums are mapped into a device of type [`vacuum`][vacuum]. The device
will support many different capabilities, such as autonomous cleaning, getting
the cleaning state and more.

## Examples

### Check if device is a vacuum

```javascript
if(device.matches('type:vacuum')) {
  /*
   * This device is a vacuum.
   */
}
```

### Check if cleaning

```javascript
// Get the current cleaning state
device.cleaning()
  .then(isCleaning => ...)
  .catch(...);

// With async/wait
const isCleaning = await device.cleaning();
```

### Request cleaning

```javascript
// Request cleaning
device.clean()
  .then(...)
  .catch(...);

// With async/await
await device.clean();
```

### Stop current cleaning

```javascript
// Stop cleaning
device.stop()
  .then(...)
  .catch(...);

// With async/await
await device.stop();
```

### Request spot cleaning

```javascript
// Spot clean
device.spotClean()
  .then(...)
  .catch(...);

// With async/await
await device.spotClean();
```

### Get the battery level

```javascript
// Get the battery level
device.batteryLevel()
  .then(level => ...)
  .catch(...);

// With async/wait
const level = await device.batteryLevel();
```
