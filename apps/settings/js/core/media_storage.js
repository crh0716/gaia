'use strict';

var DP = function(initValue) {
  var _value = initValue;
  var _observers = [];
  var _notify = function(newValue, oldValue) {
    _observers.forEach(function(callback) {
      callback(newValue, oldValue);
    });
  };
  return {
    get: function() {
      return _value;
    },
    set: function(newValue) {
      if (newValue !== _value) {
        var oldValue = _value;
        _value = newValue;
        _notify(newValue, oldValue);
      }
    },
    bind: function(callback) {
      if (callback)
        _observers.push(callback);
    },
    unbind: function(callback) {
      var index = _observers.indexOf(callback);
      if (index >= 0)
        _observers.splice(index, 1);
    }
  };
};

var MediaStorageViewModel = function() {
  var _;
  var _properties = {
    storageStatus: new DP(''),
    musicStatus: new DP(''),
    pictureStatus: new DP(''),
    videoStatus: new DP(''),
    freeStatus: new DP(''),
    musicSize: new DP(0),
    pictureSize: new DP(0),
    videoSize: new DP(0),
    freeSize: new DP(0),
    enabled: new DP(true),
    umsEnabled: new DP(null),
    umsStatus: new DP('')
  };
  var _deviceStorage = navigator.getDeviceStorage('pictures');
  var _ignoreDeviceStorageChange = false;

  if (navigator && navigator.mozL10n)
    _ = navigator.mozL10n.get;

  var _formatSize = function mediaStorageVM_formatSize(size, l10nId) {
    if (size === undefined || isNaN(size)) {
      return '';
    }

    // KB - 3 KB (nearest ones), MB, GB - 1.2 MB (nearest tenth)
    var fixedDigits = (size < 1024 * 1024) ? 0 : 1;
    var sizeInfo = FileSizeFormatter.getReadableFileSize(size, fixedDigits);

    return _(l10nId || 'storageSize', {
      size: sizeInfo.size,
      unit: _('byteUnit-' + sizeInfo.unit)
    });
  };

  var _updateInfo = function mediaStorageVM_updateInfo() {
    var self = this;
    var availreq = _deviceStorage.available();
    availreq.onsuccess = function mediaStorageVM_availSuccess(evt) {
      var state = evt.target.result;

      // update ums status
      if (_properties.umsEnabled.get()) {
        _properties.umsStatus.set(_('enabled'));
      } else if (state === 'shared') {
        _properties.umsStatus.set(_('umsUnplugToDisable'));
      } else {
        _properties.umsStatus.set(_('disabled'));
      }

      switch (state) {
        case 'shared':
          // Keep the media storage enabled,
          // so that the user goes inside to toggle USB Mass storage.
          _properties.enabled.set(true);

          var notAvailableStr = _('size-not-available');
          _properties.musicStatus.set(notAvailableStr);
          _properties.pictureStatus.set(notAvailableStr);
          _properties.videoStatus.set(notAvailableStr);
          _properties.freeStatus.set(notAvailableStr);
          _properties.storageStatus.set('');
          break;
        case 'unavailable':
          _properties.enabled.set(false);

          var notAvailableStr = _('size-not-available');
          _properties.musicStatus.set(notAvailableStr);
          _properties.pictureStatus.set(notAvailableStr);
          _properties.videoStatus.set(notAvailableStr);
          _properties.freeStatus.set(notAvailableStr);
          _properties.storageStatus.set(_('no-storage'));
          break;
        case 'available':
          _properties.enabled.set(true);

          DeviceStorageHelper.getStats(['music', 'pictures', 'videos'],
            function(sizes) {
              _properties.storageStatus.set(
                _formatSize(sizes['free'], 'availableSize'));

              _properties.musicStatus.set(_formatSize(sizes['music']));
              _properties.pictureStatus.set(_formatSize(sizes['pictures']));
              _properties.videoStatus.set(_formatSize(sizes['videos']));
              _properties.freeStatus.set(_formatSize(sizes['free']));

              _properties.musicSize.set(sizes['music']);
              _properties.pictureSize.set(sizes['pictures']);
              _properties.videoSize.set(sizes['videos']);
              _properties.freeSize.set(sizes['free']);
          });
          break;
      }
    };
  };

  var _vm = {
    handleEvent: function mediaStorageVM_handleEvent(evt) {
      switch (evt.type) {
        case 'localized':
          if (!_)
            _ = navigator.mozL10n.get;
          _updateInfo();
          break;
        case 'change':
          if (_ignoreDeviceStorageChange)
            break;

          switch (evt.reason) {
            case 'available':
            case 'unavailable':
            case 'shared':
            case 'created':
            case 'modified':
            case 'deleted':
              _updateInfo();
              break;
          }
          break;
        case 'mozvisibilitychange':
          var newValue = document.mozHidden;
          if (_ignoreDeviceStorageChange != newValue) {
            _ignoreDeviceStorageChange = newValue;
            if (!_ignoreDeviceStorageChange)
              _updateInfo();
          }
          break;
      }
    },
    bind: function mediaStorageVM_bind(propertyName, callback) {
      var property = _properties[propertyName];
      if (!property)
        return;
      property.bind(callback);
    },
    unbind: function MediaStorageVM_unbind(propertyName, callback) {
      var property = _properties[propertyName];
      if (!property)
        return;
      property.unbind(callback);
    },
    get: function mediaStorageVM_get(propertyName) {
      var property = _properties[propertyName];
      if (!property)
        return null;
      else
        return property.get();
    },
    set: function mediaStorageVM_set(propertyName, value) {
      var property = _properties[propertyName];
      if (!property)
        return;
      property.set(value);
    }
  };

  // initialization
  _deviceStorage.addEventListener('change', _vm);
  window.addEventListener('localized', _vm);
  document.addEventListener('mozvisibilitychange', _vm);
  _updateInfo.call(_vm);

  Settings.getSettings(function(result) {
    var umsEnabled = result['ums.enabled'];
    _properties.umsEnabled.set(umsEnabled);
  });

  _vm.bind('umsEnabled', function(umsEnabled) {
    _updateInfo();
  });

  return _vm;
};

var MediaStorage = (function() {
  var _viewModel = null;
  var _callbacks = [];

  var init = function() {
    _viewModel = new MediaStorageViewModel();

    while (_callbacks.length > 0) {
      var callback = _callbacks.pop();
      callback(_viewModel);
    }
  };

  if (typeof(document) !== 'undefined') {
    if (document.readyState === 'complete' ||
      document.readyState === 'interactive') {
      window.setTimeout(init);
    } else {
      window.addEventListener('DOMContentLoaded', init);
    }
  }

  return {
    viewModel: function(callback) {
      if (_viewModel) {
        callback(_viewModel);
      } else {
        _callbacks.push(callback);
      }
    }
  };
})();

MediaStorage.viewModel(function(viewModel) {
  var mediaSubtitle = document.getElementById('media-storage-desc');
  var mediaSection = document.getElementById('media-storage-section');

  mediaSubtitle.textContent = viewModel.get('storageStatus');
  viewModel.bind('storageStatus', function(newValue, oldValue) {
    mediaSubtitle.textContent = newValue;
  });

  var updateSectionEnabledState = function(enabled) {
    if (enabled) {
      mediaSection.classList.remove('disabled');
    } else {
      mediaSection.classList.add('disabled');
    }
  };
  updateSectionEnabledState(viewModel.get('enabled'));
  viewModel.bind('enabled', function(newValue, oldValue) {
    updateSectionEnabledState(newValue);
  });
});
