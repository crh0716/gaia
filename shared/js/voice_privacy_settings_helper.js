'use strict';

(function(exports) {
  var VoicePrivacySettingsHelper = function() {
    var VOICE_PRIVACY_KEY = 'ril.voicePrivacy.enabled';

    var _settings = navigator.mozSettings;
    var _mobileConnections = navigator.mozMobileConnections || [];

    var _voicePrivacyValues = null;
    var _voicePrivacyDefaultValues =
      Array.prototype.map.call(_mobileConnections, function() {
        return false;
      });

    var _isReady = false;
    var _callbacks = [];

    var _return = function vph_return(callback) {
      if (!callback) {
        return;
      }
      callback.apply(null, Array.prototype.slice.call(arguments, 1));
    };

    var _ready = function vph_ready(callback) {
      if (!callback)
        return;

      if (_isReady) {
        callback();
      } else {
        _callbacks.push(callback);
      }
    };

    /**
     * Get the value of the key VOICE_PRIVACY_KEY.
     *
     * @param {Function} callback The callback function.
     */
    var _getValue = function vph_getValue(callback) {
      var req = _settings.createLock().get(VOICE_PRIVACY_KEY);
      req.onsuccess = function() {
        _return(callback, req.result[VOICE_PRIVACY_KEY]);
      };
      req.onerror = function() {
        console.error('Error getting voice privacy settings.');
        _return(callback, null);
      };
    };

    /**
     * Get the value of the key VOICE_PRIVACY_KEY.
     *
     * @param {Array} value Voice privacy settings.
     * @param {Function} callback The callback function.
     */
    var _setValue = function vph_setValue(value, callback) {
      var obj = {};
      obj[VOICE_PRIVACY_KEY] = value;
      var req = _settings.createLock().set(obj);
      req.onsuccess = function() {
        _return(callback);
      };
      req.onerror = function() {
        console.error('Error getting voice privacy settings.');
        _return(callback);
      };
    };

    /**
     * Initialize the object based on the current settings.
     *
     * @param {Function} callback The callback function.
     */
    var _init = function vph_init(callback) {
      _getValue(function(value) {
        _voicePrivacyValues = value || _voicePrivacyDefaultValues;
        _return(callback);
      });

      _settings.addObserver(VOICE_PRIVACY_KEY, function vpChanged(e) {
        _voicePrivacyValues = e.settingValue;
      });
    };

    _init(function() {
      _isReady = true;
      _callbacks.forEach(function(callback) {
        callback();
      });
    });

    return {
      getEnabled: function(index, callback) {
        _ready(function() {
          _return(callback, _voicePrivacyValues[index] || false);
        });
      },
      setEnabled: function(index, enabled, callback) {
        _ready(function() {
          if (index < _voicePrivacyValues.length) {
            var cloneValues = JSON.parse(JSON.stringify(_voicePrivacyValues));
            cloneValues[index] = enabled;
            _setValue(cloneValues, _return.bind(null, callback));
          } else {
            _return(callback);
          }
        });
      }
    };
  };

  exports.VoicePrivacySettingsHelper = VoicePrivacySettingsHelper;
})(this);
