
// Use UMD pattern : https://github.com/umdjs/umd/blob/master/templates/commonjsStrict.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['exports', 'leaflet'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    // CommonJS
    factory(exports, require('leaflet'));
  } else {
    // Browser globals
    factory((root.leafletGPSTracker = {}), root.L);
    root.GPSControl = root.leafletGPSTracker.GPSControl;
  }
}(typeof self !== 'undefined' ? self : this, function (exports, L) {
  exports.GPSControl = L.Control.extend({
    options: {
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
    },
    initialize: function(options) {
      L.Util.setOptions(this, options);
    },
    onAdd: function(map) {
      var _this = this;
      this._div = L.DomUtil.create('div', 'leaflet-bar gps-control');
      this._a = L.DomUtil.create('a', '', this._div);
      this._i = L.DomUtil.create('i', this.options.class || 'material-icons', this._a);
      setTimeout(function() {
        _this.updateActive(_this.options.active)
      }, 100);

      this._a.addEventListener('click', function(e) {
        _this.updateActive(!_this.active);
        e.stopPropagation();
      });

      return this._div;
    },
    onRemove: function(map) {
      this._clearWatch();
    },
    updateActive: function(value) {
      var _this = this;
      if (value === this.active) return;
      this.active = value;
      this._i.innerHTML = this.active ? this.options.offClass : this.options.onClass;
      this._a.title = this.active ? this.options.onTitle : this.options.offTitle;
      if (this.options.activeCallback) {
        this.options.activeCallback(this.active);
      }

      if (this.active) {
        if (window.navigator && window.navigator.geolocation) {
          this._clearWatch();
          this._watchPosition = window.navigator.geolocation.watchPosition(
            function(pos) { _this._success(pos); },
            function(err) { _this._error(err); },
            { enableHighAccuracy: true }
          );
        } else {
          this._error(new Error('No valid window.navigator.geolocation object found (incompatible browser ?)'));
        }
      } else {
        this._clearWatch();
      }
    },
    _success(pos) {
      // should not be possible
      if (!this.active) return;

      const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);

      // Ignore smallest changes
      if (this.options.precision > 0 && this._last && latlng.distanceTo(this._last) < this.options.precision) {
        return;
      }
      this._last = latlng;

      if (this.options.successCallback) {
        this.options.successCallback(latlng);
      }
    },
    _error(err) {
      if (this.options.errorCallback) {
        this.options.errorCallback(err);
      }

      this._clearWatch()
      this.remove()
    },
    _clearWatch() {
      this._last = null;
      if (this._watchPosition) {
        navigator.geolocation.clearWatch(this._watchPosition);
      }
    }
  })

}));
