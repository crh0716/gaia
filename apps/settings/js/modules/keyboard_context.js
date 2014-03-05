/**
 * KeyboardContext provides installed keyboard apps and enabled keyboard layouts
 * in terms of ObservableArrays. It listens to the events from KeyboardHelper
 * and update the ObservableArrays.
 * KeyboardHelper helps on the following things:
 *   - Get all installed keyboard apps and layouts.
 *   - Enable or disable keyboard layouts.
 *   - Notify keyboard layout changes via the 'keyboardsrefresh' event.
 * KeyboardContext handles only data and does not involve in any UI logic.
 *
 * @module KeyboardContext
 */
define(['modules/mvvm/observable', 'modules/mvvm/observable_array',
        'shared/keyboard_helper', 'shared/manifest_helper'],
  function(Observable, ObservableArray, KeyboardHelper, ManifestHelper) {
    'use strict';

    // stores layout indexed by app manifestURL and layoutId
    var _layoutDict = null;

    var _keyboards = ObservableArray([]);
    var _enabledLayouts = ObservableArray([]);

    var _isReady = false;
    var _parsingApps = false;
    var _callbacks = [];
    var _defaultEnabledCallbacks = [];

    var Keyboard = function(name, description, launchPath, layouts, app) {
      var _observable = Observable({
        name: name,
        description: description,
        launchPath: launchPath,
        layouts: layouts,
        app: app
      });

      return _observable;
    };

    var Layout =
      function(id, appName, appManifestURL, name, description, types, enabled) {
        var _observable = Observable({
          id: id,
          appName: appName,
          name: name,
          description: description,
          types: types,
          enabled: enabled
        });

        // Layout enabled changed.
        _observable.observe('enabled', function(newValue, oldValue) {
          if (!_parsingApps) {
            KeyboardHelper.setLayoutEnabled(appManifestURL, id, newValue);
            // only check the defaults if we disabled a checkbox
            if (!newValue) {
              KeyboardHelper.checkDefaults(notifyDefaultEnabled);
            }
          }
        });

        return _observable;
    };

    var _waitForLayouts;

    function notifyDefaultEnabled(layouts) {
      _defaultEnabledCallbacks.forEach(function withCallbacks(callback) {
        callback(layouts[0]);
      });
    }

    function updateLayouts(layouts, reason) {
      function mapLayout(layout) {
        var app = _layoutDict[layout.app.manifestURL];
        if (!app) {
          app = _layoutDict[layout.app.manifestURL] = {};
        }
        if (app[layout.layoutId]) {
          app[layout.layoutId].enabled = layout.enabled;
          return app[layout.layoutId];
        }
        app[layout.layoutId] = Layout(layout.layoutId,
          layout.manifest.name, layout.app.manifestURL,
          layout.inputManifest.name, layout.inputManifest.description,
          layout.inputManifest.types, layout.enabled);
        return app[layout.layoutId];
      }

      function reduceApps(carry, layout) {
        // if we already found this app, add it to the layouts
        if (!carry.some(function checkApp(app) {
          if (app.app === layout.app) {
            app.layouts.push(mapLayout(layout));
            return true;
          }
        })) {
          carry.push({
            app: layout.app,
            manifest: layout.manifest,
            layouts: [mapLayout(layout)]
          });
        }
        return carry;
      }

      function mapKeyboard(app) {
        return Keyboard(app.manifest.name, app.manifest.description,
          app.manifest.launch_path, app.layouts, app.app);
      }

      _parsingApps = true;

      // if we changed apps
      if (reason.apps) {
        // re parse every layout
        _layoutDict = {};
        var apps = layouts.reduce(reduceApps, []);
        var keyboards = apps.map(mapKeyboard);
        _keyboards.reset(keyboards);
      }
      var enabled = layouts.filter(function filterEnabled(layout) {
        return layout.enabled;
      }).map(mapLayout);
      _enabledLayouts.reset(enabled);

      _parsingApps = false;

      if (_waitForLayouts) {
        _waitForLayouts();
        _waitForLayouts = undefined;
      }
    }

    var _init = function(callback) {
      window.addEventListener('localized', function() {
        // refresh keyboard and layout in _keyboards
        _keyboards.forEach(function(keyboard) {
          var keyboardAppInstance = keyboard.app;
          var keyboardManifest =
            new ManifestHelper(keyboardAppInstance.manifest);
          var inputs = keyboardManifest.inputs;
          keyboard.name = keyboardManifest.name;
          keyboard.description = keyboardManifest.description;
          keyboard.layouts.forEach(function(layout) {
            var key = layout.id;
            var layoutInstance = inputs[key];
            layout.appName = keyboardManifest.name;
            layout.name = layoutInstance.name;
            layout.description = layoutInstance.description;
          });
        });
      });
      _waitForLayouts = callback;
      KeyboardHelper.stopWatching();
      KeyboardHelper.watchLayouts(updateLayouts);
    };

    var _ready = function(callback) {
      if (!callback) {
        return;
      }

      if (_isReady) {
        callback();
      } else {
        _callbacks.push(callback);
      }
    };

    return {
      reset: function kc_reset() {
        _layoutDict = null;
        _keyboards = ObservableArray([]);
        _enabledLayouts = ObservableArray([]);
        _isReady = false;
        _parsingApps = false;
        _callbacks = [];
        _defaultEnabledCallbacks = [];
      },
      init: function kc_init(callback) {
        _defaultEnabledCallbacks = [];
        _isReady = false;
        _init(function() {
          _isReady = true;
          _callbacks.forEach(function(callback) {
            callback();
          });
        });
        _ready(callback);
      },
      keyboards: function kc_keyboards(callback) {
        _ready(function() {
          callback(_keyboards);
        });
      },
      enabledLayouts: function kc_enabledLayouts(callback) {
        _ready(function() {
          callback(_enabledLayouts);
        });
      },
      defaultKeyboardEnabled: function kc_defaultKeyboardEnabled(callback) {
        _defaultEnabledCallbacks.push(callback);
      }
    };
});
