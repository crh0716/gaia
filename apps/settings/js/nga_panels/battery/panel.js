define(function(require) {
  'use strict';

  var threads = require('vendor/threads');
  var SettingsPanel = require('modules/settings_panel');

  return function ctor_battery_panel() {
    var BatteryService = null;
    var _batteryLevelText = null;

    var now = window.performance.now();
    var _refreshText = function() {
      return Promise.all([
        BatteryService.method('level'),
        BatteryService.method('state')
      ]).then((results) => {
        console.log('=== time required: ' + (window.performance.now() - now));
        var level = results[0];
        var state = results[1];
        navigator.mozL10n.setAttributes(_batteryLevelText,
                                      'batteryLevel-percent-' + state,
                                      { level: level });
      });
    };

    return SettingsPanel({
      onInit: function bp_onInit(rootElement) {
        threads.manager({
          'battery-service': {
            src: '/js/services/battery_service.html',
            type: 'window'
          }
        });
        BatteryService = threads.client('battery-service');
        BatteryService.on('propertychange', _refreshText);
        _batteryLevelText = rootElement.querySelector(
          '#battery-level span:last-of-type');
      },
      onShow: function bp_onBeforeShow(rootElement) {
        BatteryService.connect();
        _refreshText();
      },
      onBeforeHide: function bp_onBeforeHide() {
        BatteryService.disconnect();
      }
    });
  };
});
