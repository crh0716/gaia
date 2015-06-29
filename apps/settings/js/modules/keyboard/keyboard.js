define(function(require) {
  'use strict';

  var Module = require('modules/base/module');
  var Observable = require('modules/mvvm/observable');
  var ManifestHelper = require('shared/manifest_helper');

  /**
   * @class Keyboard
   * @param {Object} KeyboardApp
   * @returns {Keyboard}
   */
  var Keyboard = Module.create(function Keyboard(keyboardApp) {
    this.super(Observable).call(this);

    this._name = keyboardApp.manifest.name;
    this._description = keyboardApp.manifest.description;
    this._launchPath = keyboardApp.manifest.launch_path;
    this._layouts = keyboardApp.layouts;
    this._app = keyboardApp.app;
    this._manifestHelper = new ManifestHelper(this._app.manifest);

    navigator.mozL10n.ready(() => {
      this._name = this._manifestHelper.name;
      this._description = this._manifestHelper.description;
    });
  }).extend(Observable);

  /**
   * The launch path of the keyboard.
   *
   * @access public
   * @readonly
   * @memberOf Keyboard.prototype
   * @type {String}
   */
  Object.defineProperty(Keyboard.prototype, 'launchPath', {
    get: function() {
      return this._launchPath;
    }
  });

  /**
   * The available layouts of the keyboard.
   *
   * @access public
   * @readonly
   * @memberOf Keyboard.prototype
   * @type {ObservableArray.<KeyboardLayout>}
   */
  Object.defineProperty(Keyboard.prototype, 'layouts', {
    get: function() {
      return this._layouts;
    }
  });

  /**
   * The app instance of the keyboard.
   *
   * @access public
   * @readonly
   * @memberOf Keyboard.prototype
   * @type {DomApplication}
   */
  Object.defineProperty(Keyboard.prototype, 'app', {
    get: function() {
      return this._app;
    }
  });

  /**
   * The name of the keyboard.
   *
   * @access public
   * @readonly
   * @memberOf Keyboard.prototype
   * @type {String}
   */
  Observable.defineObservableProperty(Keyboard.prototype, 'name', {
    readonly: true,
    value: ''
  });

  /**
   * The description of the keyboard.
   *
   * @access public
   * @readonly
   * @memberOf Keyboard.prototype
   * @type {String}
   */
  Observable.defineObservableProperty(Keyboard.prototype, 'description', {
    readonly: true,
    value: ''
  });

  return Keyboard;
});
