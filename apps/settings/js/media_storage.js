/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/**
 * The whole purpose of this code is to detect when we're in the state of having
 * the UMS Enabled checkbox unchecked, but the SD-card is still being shared
 * with the PC.
 *
 * In this case, the user has to unplug the USB cable in order to actually turn
 * off UMS, and we put some text to that effect on the settings screen.
 */

var StackedBarViewModel = function(mediaStorageViewModel) {
  var _mediaStorageViewModel = mediaStorageViewModel;
  var _properties = {
    musicPercentage: new DP('0'),
    picturePercentage: new DP('0'),
    videoPercentage: new DP('0'),
    freePercentage: new DP('0')
  };
  var bindingMap = {
    'musicSize': _properties.musicPercentage,
    'pictureSize': _properties.picturePercentage,
    'videoSize': _properties.videoPercentage,
    'freeSize': _properties.freePercentage
  };

  var _refresh = function() {
    var total = 0;
    var values = [];
    for (var prop in bindingMap) {
      var value = _mediaStorageViewModel.get(prop);
      total += value;
      values.push(value);
    }
    for (var prop in bindingMap) {
      var property = bindingMap[prop];
      var percentage = 100 * values.shift() / total;
      property.set(percentage + '%');
    }
  };

  var _vm = {
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
    }
  };

  // initialization
  for (var prop in bindingMap) {
    _mediaStorageViewModel.bind(prop, function() {
      _refresh();
    });
  }
  _refresh();

  return _vm;
};

MediaStorage.viewModel(function(viewModel) {
  (function initStackedBar() {
    var stackedBarViewModel = new StackedBarViewModel(viewModel);
    var stackedBar = document.getElementById('space-stackedbar');
    var bindingProperties = ['music', 'picture', 'video', 'free'];
    var bindingMap = {};

    bindingProperties.forEach(function(property) {
      var itemID = 'stackedbar-item-' + property;
      var item = document.getElementById(itemID);

      if (!item) {
        item = document.createElement('span');
        item.className = 'stackedbar-item';
        item.id = itemID;
        stackedBar.appendChild(item);
      }
      bindingMap[property + 'Percentage'] = item;
    });

    for (var prop in bindingMap) {
      var element = bindingMap[prop];
      (function(element) {
        element.style.width = stackedBarViewModel.get(prop);
        stackedBarViewModel.bind(prop, function(newValue, oldValue) {
          element.style.width = newValue;
        });
      })(element);
    }
  })();

  (function initTextItems() {
    var musicDesc = document.querySelector('#music-space .size');
    var pictureDesc = document.querySelector('#pictures-space .size');
    var videoDesc = document.querySelector('#videos-space .size');
    var freeSpaceDesc = document.querySelector('#media-free-space .size');

    var bindingMap = {
      'musicStatus': musicDesc,
      'pictureStatus': pictureDesc,
      'videoStatus': videoDesc,
      'freeStatus': freeSpaceDesc
    };

    for (var prop in bindingMap) {
      var element = bindingMap[prop];
      (function(element) {
        element.textContent = viewModel.get(prop);
        viewModel.bind(prop, function(newValue, oldValue) {
          element.textContent = newValue;
        });
      })(element);
    }
  })();

  (function initUMS() {
    var umsEnabledCheckBox = document.querySelector('[name="ums.enabled"]');
    var umsEnabledInfoBlock = document.getElementById('ums-desc');
    if (umsEnabledCheckBox && umsEnabledInfoBlock) {
      // The normal handling of the checkboxes in the settings is done through a
      // 'change' event listener in settings.js
      umsEnabledCheckBox.onchange = function umsEnabledChanged() {
        viewModel.set('umsEnabled', this.checked);
      };

      umsEnabledInfoBlock.textContent = viewModel.get('umsStatus');
      viewModel.bind('umsStatus', function(newValue, oldValue) {
        umsEnabledInfoBlock.textContent = newValue;
      });
    }
  })();
});
