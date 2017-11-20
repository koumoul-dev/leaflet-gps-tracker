
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
      noTrackTitle: 'Locate with GPS',
      offTitle: 'Activate GPS tracking',
      onTitle: 'Deactivate GPS tracking',
      active: true,
      precision: 5,
      track: true,
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
        if (_this.options.track) {
          _this.updateActive(_this.options.active);
        } else {
          _this._i.innerHTML = _this.options.onClass;
          _this._a.title = _this.options.noTrackTitle;
          if (_this.options.active) {
            _this.locate()
          }
        }
      }, 100);

      this._a.addEventListener('click', function(e) {
        if (_this.options.track) {
          _this.updateActive(!_this.active);
        } else {
          _this.locate()
        }
        e.stopPropagation();
      });

      return this._div;
    },
    onRemove: function(map) {
      this._clearWatch();
    },
    locate: function() {
      // Used when in one time GPS locating mode

      var _this = this;

      if (this._savedLast && this.options.successCallback) {
        this.options.successCallback(this._savedLast);
      }

      if (window.navigator && window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(
          function(pos) { _this._success(pos); },
          function(err) { _this._error(err); },
          { enableHighAccuracy: true }
        );
      } else {
        this._error(new Error('No valid window.navigator.geolocation object found (incompatible browser ?)'));
      }
    },
    updateActive: function(value) {
      // Used when in active tracking mode

      var _this = this;
      if (value === this.active) return;
      this.active = value;

      if (this.options.activeCallback) {
        this.options.activeCallback(this.active);
      }

      if (this.active && !this.options.track) {
        return this.locate();
      }

      this._i.innerHTML = this.active ? this.options.offClass : this.options.onClass;
      this._a.title = this.active ? this.options.onTitle : this.options.offTitle;

      if (this.active) {
        if (this._savedLast && this.options.successCallback) {
          this.options.successCallback(this._savedLast);
        }

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
    _success: function(pos) {
      // should not be possible
      if (this.options.track && !this.active) return;

      const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);

      // Ignore smallest changes
      if (this.options.track && this.options.precision > 0 && this._last && latlng.distanceTo(this._last) < this.options.precision) {
        return;
      }
      this._last = latlng;
      this._savedLast = latlng;

      if (this.options.successCallback) {
        this.options.successCallback(latlng);
      }
    },
    _error: function(err) {
      if (this.options.errorCallback) {
        this.options.errorCallback(err);
      }

      this._clearWatch()
      this.remove()
    },
    _clearWatch: function() {
      this._last = null;
      if (this._watchPosition) {
        navigator.geolocation.clearWatch(this._watchPosition);
      }
    }
  })

}));
