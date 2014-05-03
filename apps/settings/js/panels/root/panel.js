define(function(require) {
  'use strict';

  var SettingsPanel = require('modules/settings_panel');
  var Core = require('panels/root/core');
  var BatteryItem = require('panels/root/battery_item');

  return function ctor_root_panel() {
    var core = null;
    var batteryItem = null;

    return SettingsPanel({
      onInit: function rp_onInit(rootElement) {
        core = Core();
        core.init();

        batteryItem = BatteryItem(rootElement.querySelector('.battery-desc'));
      },
      onBeforeShow: function rp_onBeforeShow() {
        batteryItem.enabled = true;
      },
      onHide: function rp_onBeforeHide() {
        batteryItem.enabled = false;
      }
    });
  };
});
