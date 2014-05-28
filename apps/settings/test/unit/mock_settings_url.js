/* global define */
define(function() {
  'use strict';
  var ctor = function() {
    this._isBlob = false;
    this._url = null;
  };
  ctor.prototype = {
    set: function(value) {
      if (this._isBlob) {
        window.URL.revokeObjectURL(this._url);
      }
      if (value instanceof Blob) {
        this._isBlob = true;
        this._url = window.URL.createObjectURL(value);
      } else {
        this._isBlob = false;
        this._url = value;
      }
      return this._url;
    },

    get: function() {
      return this._url;
    },

    // custom settings
    mockSetup: function(value) {
      this._url = value;
    },

    mTeardown: function() {
      this._url = null;
    }
  };

  return ctor;
});
