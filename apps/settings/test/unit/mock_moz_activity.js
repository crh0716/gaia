/* global define */
define(function() {
  'use strict';
  var successResult = {};
  var settingData;
  var mCtor = {
    onsuccess: function() {},
    onerror: function() {},
    get result() {
      return successResult;
    },
    mSetupData: function(data) {
      successResult = data;
    },
    mTeardownData: function(data) {
      successResult = {};
    },
    mTriggerOnSuccess: function() {
      this.onsuccess();
    },
    mTriggerOnError: function() {
      this.onerror();
    },
    mGetSettingData: function() {
      return settingData;
    }
  };

  var ctor = function(data) {
    settingData = data;
    return mCtor;
  };

  return {
    constr: ctor,
    mConstr: mCtor
  };
});
