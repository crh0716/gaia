/* global define */
define(function() {
  'use strict';
  var _settings = {};

  var ctor = {
    get cache() {
      return _settings;
    },
    getSettings: function(callback) {
      callback(_settings);
    },

    // custom settings
    mockSettings: function(value) {
      _settings = value;
    },

    mTeardown: function() {
      _settings = {};
    }
  };

  return ctor;
});
