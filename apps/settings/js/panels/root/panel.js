define(function(require) {
  'use strict';

  var SettingsPanel = require('modules/settings_panel');
  var Core = require('panels/root/core');

  return function ctor_root_panel() {
    var core = Core();

    return SettingsPanel({
      onInit: function() {
        core.init();
      }
    });
  };
});
