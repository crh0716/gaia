/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/**
 * This file manages airplane mode interaction within the settings app.
 * The airplane mode button is disabled when the user taps it.
 * We then determine the number of components that need to change,
 * and fire off an event only when all components are ready.
 */

'use strict';

var AirplaneMode = {

  /**
   * Counter for operstions before radiosafe event
   * Updated when we toggle radio mode
   * @private
   */
  _ops: 0,

  /**
   * Whether or not we are firing the event for airplane mode
   * @private
   */
  _doNotify: false,

  element: document.querySelector('#airplaneMode-input'),

  /**
   * Notifies apps that components are in a stable state
   * This waits until all components are enabled after changing airplane mode
   * @param {String} the setting name.
   */
  notify: function(name) {
    if (!this._doNotify)
      return;

    this._ops--;
    if (this._ops === 0) {
      this._doNotify = false;
      this._enableRadioSwitch();
    }
  },

  /**
   * Enable the radio switch
   */
  _enableRadioSwitch: function() {
    this.element.disabled = false;
  },

  _initRadioSwitch: function(checkbox) {
    var settings = Settings.mozSettings;
    var self = this;

    var _setRadioEnabled = function(enabled, onsuccess, onerror) {
      onsuccess = onsuccess || function() {};
      onerror = onerror || function() {};

      var mobileConnection = getMobileConnection();
      if (!mobileConnection) {
        onerror();
      }

      var req = mobileConnection.setRadioEnabled(enabled);
      req.onsuccess = onsuccess;
      req.onerror = onerror;
    };

    // Called when the user interacts with the airplane_mode switch
    var onchange = function(e) {
      dump('=== checkbox changed ' + this.checked);

      this.disabled = true;
      var enabled = !this.checked;
      _setRadioEnabled(enabled, function onsuccess() {
        settings.createLock().set({'ril.radio.disabled': !enabled});
      });
    };

    Settings.getSettings(function(result) {
      self.element.disabled = false;
      var radioDisabled = result['ril.radio.disabled'];
      self.element.checked = radioDisabled;
      // Disable airplane mode when we interact with it
      self.element.addEventListener('change', self);
    });
  },

  init: function apm_init() {
    var mobileConnection = getMobileConnection();
    var wifiManager = WifiHelper.getWifiManager();

    var settings = Settings.mozSettings;
    if (!settings)
      return;

    // Initialize the airplane mode switch
    this._initRadioSwitch();

    var self = this;
    var mobileDataEnabled = false;
    settings.addObserver('ril.data.enabled', function(e) {
      mobileDataEnabled = e.settingValue;
      self.notify('ril.data.enabled');
    });

    var bluetoothEnabled = false;
    var wifiEnabled = false;
    var geolocationEnabled = false;
    settings.addObserver('geolocation.enabled', function(e) {
      geolocationEnabled = e.settingValue;
      self.notify('geolocation.enabled');
    });

    // when wifi is really enabled, notify if needed
    window.addEventListener('wifi-enabled', function() {
      wifiEnabled = true;
      self.notify('wifi.enabled');
    });

    // when wifi is really disabled, notify if needed
    window.addEventListener('wifi-disabled', function() {
      wifiEnabled = false;
      self.notify('wifi.enabled');
    });

    if (window.gBluetooth) {
      // when bluetooth is really enabled, notify if needed
      window.addEventListener('bluetooth-adapter-added', function() {
        bluetoothEnabled = true;
        self.notify('bluetooth.enabled');
      });

      // when bluetooth is really disabled, notify if needed
      window.addEventListener('bluetooth-disabled', function() {
        bluetoothEnabled = false;
        self.notify('bluetooth.enabled');
      });
    }

    var restoreMobileData = false;
    var restoreBluetooth = false;
    var restoreWifi = false;
    var restoreGeolocation = false;

    settings.addObserver('ril.radio.disabled', function(e) {
      dump('=== settings: ril.radio.disabled ' + e.settingValue);
      // Reset notification params
      self._ops = 0;
      self._doNotify = true;

      if (e.settingValue) {
        if (mobileConnection) {
          restoreMobileData = mobileDataEnabled;
          if (mobileDataEnabled)
            self._ops++;
        }

        // Bluetooth.
        if (window.gBluetooth) {
          restoreBluetooth = bluetoothEnabled;
          if (bluetoothEnabled)
            self._ops++;
        }

        // Wifi.
        if (wifiManager) {
          restoreWifi = wifiEnabled;
          if (wifiEnabled)
            self._ops++;
        }

        // Geolocation
        restoreGeolocation = geolocationEnabled;
        if (geolocationEnabled)
          self._ops++;

      } else {
        // Don't count mobile data if it's already on
        if (mobileConnection && !mobileDataEnabled && restoreMobileData)
          self._ops++;

        // Don't count Bluetooth if it's already on
        if (window.gBluetooth && !gBluetooth.enabled && restoreBluetooth)
          self._ops++;

        // Don't count Wifi if it's already on
        if (wifiManager && !wifiManager.enabled && restoreWifi)
          self._ops++;

        // Don't count Geolocation if it's already on
        if (!geolocationEnabled && restoreGeolocation)
          self._ops++;
      }

      // If we have zero operations to perform, enable the radio switch
      if (self._ops === 0)
        self.enableRadioSwitch();
    });
  }
};

// starting when we get a chance
navigator.mozL10n.ready(function loadWhenIdle() {
  var idleObserver = {
    time: 5,
    onidle: function() {
      AirplaneMode.init();
      navigator.removeIdleObserver(idleObserver);
    }
  };
  navigator.addIdleObserver(idleObserver);
});
