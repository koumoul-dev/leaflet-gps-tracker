# leaflet-gps-tracker

Customizable control to integrate navigator.geolocation.watchPosition functionalities in leaflet.

[Check it out](https://koumoul-dev.github.io/leaflet-gps-tracker/).

## Default options

```js
{
  position: 'topleft',
  class: 'material-icons',
  offClass: 'gps_off',
  onClass: 'gps_fixed',
  offTitle: 'Activate GPS tracking',
  onTitle: 'Deactivate GPS tracking',
  active: true,
  precision: 5,
  activeCallback: function(active) {
    console.log('GPS tracking is active ? ' + active);
  },
  successCallback: function(latlng) {
    console.log('GPS tracking detected a position change : ' + latlng);
  },
  errorCallback: function(err) {
    console.error('GPS tracking failed : ' + err.message);
  }
}
```
