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
define(function(require) {
  'use strict';

  var Module = require('modules/base/module');
  var Observable = require('modules/mvvm/observable');
  var ObservableArray = require('modules/mvvm/observable_array');
  var KeyboardHelper = require('shared/keyboard_helper');
  var Keyboard = require('modules/keyboard/keyboard');
  var KeyboardLayout = require('modules/keyboard/keyboard_layout');

  /**
   * @class KeyboardContext
   * @requires module:modules/base/module
   * @requires module:modules/mvvm/observable
   * @requires module:modules/mvvm/observable_array
   * @requires module:shared/keyboard_helper
   * @requires module:shared/manifest_helper
   * @returns {KeyboardContext}
   */
  var KeyboardContext = Module.create(function KeyboardContext() {
    this.super(Observable).call(this);

    // stores layout indexed by app manifestURL and layoutId
    this._layoutDict = null;
    this._waitForLayouts = null;
    this._keyboards = ObservableArray([]);
    this._enabledLayouts = ObservableArray([]);
    this._isReady = false;
    this._callbacks = [];
    this._defaultEnabledCallbacks = [];
  }).extend(Observable);

  /**
   * The installed keyboards in terms of an observable array.
   *
   * @access public
   * @readonly
   * @memberOf KeyboardContext.prototype
   * @type {ObservableArray.<Keyboard>}
   */
  Object.defineProperty(KeyboardContext.prototype, 'keyboards', {
    get: function() {
      return this._keyboards;
    }
  });

  /**
   * Get the enabled layouts in terms of an observable array.
   *
   * @access public
   * @readonly
   * @memberOf KeyboardContext.prototype
   * @type {ObservableArray.<Layout>}
   */
  Object.defineProperty(KeyboardContext.prototype, 'enabledLayouts', {
    get: function() {
      return this._enabledLayouts;
    }
  });

  /**
   * Initialize the keyboard context. After the context initialized, we are
   * able to get the installed keyboards and enabled layouts.
   *
   * @access private
   * @param {Function} callback
   *                   The callback when the context is initialized.
   */
  KeyboardContext.prototype._init = function(callback) {
    /*window.addEventListener('localized', () => {
      // refresh keyboard and layout in _keyboards
      this._keyboards.forEach(function(keyboard) {
        var keyboardAppInstance = keyboard.app;
        var keyboardManifest =
          new ManifestHelper(keyboardAppInstance.manifest);
        var inputs = keyboardManifest.inputs;
        //keyboard.name = keyboardManifest.name;
        //keyboard.description = keyboardManifest.description;
        keyboard.layouts.forEach(function(layout) {
          var key = layout.id;
          var layoutInstance = inputs[key];
          layout.appName = keyboardManifest.name;
          layout.name = layoutInstance.name;
          layout.description = layoutInstance.description;
        });
      });
    });*/
    this._waitForLayouts = callback;
    KeyboardHelper.stopWatching();
    KeyboardHelper.watchLayouts(this._updateLayouts.bind(this));
  };

  KeyboardContext.prototype._ready = function(callback) {
    if (!callback) {
      return;
    }

    if (this._isReady) {
      callback();
    } else {
      this._callbacks.push(callback);
    }
  };

  KeyboardContext.prototype._refreshEnabledLayouts =
    function(reEnabledLayouts) {
      reEnabledLayouts.forEach((layout) => {
        var app = this._layoutDict[layout.app.manifestURL];
        if (app) {
          app[layout.layoutId].enabled = true;
        }
      });
  };

  KeyboardContext.prototype._notifyDefaultEnabled =
    function(layouts, missingTypes) {
      this._defaultEnabledCallbacks.forEach((callback) => {
        callback(layouts[0], missingTypes[0]);
      });
  };

  KeyboardContext.prototype._updateLayouts = function(layouts, reason) {
    var mapLayout = function(layout) {
      var app = this._layoutDict[layout.app.manifestURL];
      if (!app) {
        app = this._layoutDict[layout.app.manifestURL] = {};
      }
      if (app[layout.layoutId]) {
        app[layout.layoutId].enabled = layout.enabled;
        return app[layout.layoutId];
      }
      var wrappedLayout = KeyboardLayout(layout);
      app[layout.layoutId] = wrappedLayout;

      // Layout enabled changed.
      wrappedLayout.observe('enabled', (newValue, oldValue) => {
        KeyboardHelper.setLayoutEnabled(wrappedLayout.appManifestURL,
          wrappedLayout.id, newValue);
        // only check the defaults if we disabled a checkbox
        if (!newValue) {
          KeyboardHelper.checkDefaults((layouts, missingTypes) => {
            this._refreshEnabledLayouts(layouts);
            this._notifyDefaultEnabled(layouts, missingTypes);
          });
        }
      });
      return wrappedLayout;
    }.bind(this);

    var reduceApps = function(carry, layout) {
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
    }.bind(this);

    function mapKeyboard(app) {
      return Keyboard(app);
    }

    // if we changed apps
    if (reason.apps) {
      // re parse every layout
      this._layoutDict = {};
      var apps = layouts.reduce(reduceApps, []);
      var keyboards = apps.map(mapKeyboard);
      this._keyboards.reset(keyboards);
    }

    var enabled = layouts.filter(function filterEnabled(layout) {
      return layout.enabled;
    }).map(mapLayout);
    this._enabledLayouts.reset(enabled);

    if (this._waitForLayouts) {
      this._waitForLayouts();
      this._waitForLayouts = undefined;
    }
  };

  /**
   * Reset the keyboard context. It clears all cached data of installed
   * keyboards and current enabled layouts.
   */
  KeyboardContext.prototype.reset = function() {
    this._layoutDict = null;
    this._keyboards.reset([]);
    this._enabledLayouts.reset([]);
    this._isReady = false;
    this._callbacks = [];
    this._defaultEnabledCallbacks = [];
  };

  /**
   * Initialize the keyboard context. After the context initialized, we are
   * able to get the installed keyboards and enabled layouts.
   *
   * @access public
   * @param {Function} callback
   *                   The callback when the context is initialized.
   */
  KeyboardContext.prototype.init = function(callback) {
    this._defaultEnabledCallbacks = [];
    this._isReady = false;
    this._init(() => {
      this._isReady = true;
      this._callbacks.forEach(function(callback) {
        callback();
      });
    });
    this._ready(callback);
  };

  /**
   * Add a callback to be triggered when the default keyboard is enabled.
   *
   * @param {Function} callback
   *                   The callback to be triggered.
   */
  KeyboardContext.prototype.defaultKeyboardEnabled = function(callback) {
    this._defaultEnabledCallbacks.push(callback);
  };

  return KeyboardContext();
});
