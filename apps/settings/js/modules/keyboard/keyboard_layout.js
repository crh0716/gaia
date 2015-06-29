define(function(require) {
  'use strict';

  var Module = require('modules/base/module');
  var Observable = require('modules/mvvm/observable');
  var ManifestHelper = require('shared/manifest_helper');

  /**
   * @class KeyboardLayout
   * @param {String} id
                     The id of the layout.
   * @param {String} appName
                     The name of the keyboard app containing the layout.
   * @param {String} appManifestURL
                     The manifest url of the keyboard app containing the layout.
   * @param {String} name
                     The name of the layout.
   * @param {String} description
                     The description of the layout.
   * @param {Array} types
                    The supported input types of the layout.
   * @param {Boolean} enabled
                      The value indicating if the layout is enabled or not.
   * @returns {KeyboardLayout}
   */
  var KeyboardLayout = Module.create(function KeyboardLayout(layout) {
    this.super(Observable).call(this);

    this._id = layout.layoutId;
    this._appName = layout.manifest.name;
    this._appManifestURL = layout.app.manifestURL;
    this._name = layout.inputManifest.name;
    this._description = layout.inputManifest.description;
    this._types = layout.inputManifest.types;
    this.enabled = layout.enabled;
    this._appManifestHelper = new ManifestHelper(layout.app.manifest);
    this._manifestHelper = new ManifestHelper(layout.inputManifest);

    navigator.mozL10n.ready(() => {
      this._appName = this._appManifestHelper.name;
      this._name = this._manifestHelper.name;
      this._description = this._manifestHelper.description;
    });
  }).extend(Observable);

  /**
   * The supported input types of the layout.
   *
   * @access public
   * @readonly
   * @memberOf KeyboardLayout.prototype
   * @type {Array}
   */
  Object.defineProperty(KeyboardLayout.prototype, 'types', {
    get: function() {
      return this._types;
    }
  });

  /**
   * The manifest url of the keyboard app containing the layout.
   *
   * @access public
   * @readonly
   * @memberOf KeyboardLayout.prototype
   * @type {Array}
   */
  Object.defineProperty(KeyboardLayout.prototype, 'appManifestURL', {
    get: function() {
      return this._appManifestURL;
    }
  });


  /**
   * The name of the keyboard app containing the layout.
   *
   * @access public
   * @readonly
   * @memberOf KeyboardLayout.prototype
   * @type {String}
   */
  Observable.defineObservableProperty(KeyboardLayout.prototype, 'appName', {
    readonly: true,
    value: ''
  });

  /**
   * The name of the layout.
   *
   * @access public
   * @readonly
   * @memberOf KeyboardLayout.prototype
   * @type {String}
   */
  Observable.defineObservableProperty(KeyboardLayout.prototype, 'name', {
    readonly: true,
    value: ''
  });

  /**
   * The description of the layout.
   *
   * @access public
   * @readonly
   * @memberOf KeyboardLayout.prototype
   * @type {String}
   */
  Observable.defineObservableProperty(KeyboardLayout.prototype, 'description', {
    readonly: true,
    value: ''
  });

  /**
   * The description of the layout.
   *
   * @access public
   * @readonly
   * @memberOf KeyboardLayout.prototype
   * @type {String}
   */
  Observable.defineObservableProperty(KeyboardLayout.prototype, 'enabled', {
    value: false
  });

  return KeyboardLayout;
});
