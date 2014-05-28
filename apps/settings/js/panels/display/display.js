/**
 * Handle display panel functionality.
 */
define(function(require) {
  'use strict';
  var SettingsListener = require('shared/settings_listener');

  var Display = function() {
    this.elements = null;
  };

  Display.prototype = {
    init: function d_init(elements) {
      this.elements = elements;
    },

    sensorStart: function d_load_sensor_config(data) {
      var autoBrightnessSetting = 'screen.automatic-brightness';
      var sensorConfig = data;

      if (sensorConfig.ambientLight) {
        this.elements.brightnessAuto.hidden = false;
        SettingsListener.observe(autoBrightnessSetting, false, function(value) {
          this.elements.brightnessManual.hidden = value;
        }.bind(this));
      } else {
        this.elements.brightnessAuto.hidden = true;
        this.elements.brightnessManual.hidden = false;
        var cset = {};
        cset[autoBrightnessSetting] = false;
        SettingsListener.getSettingsLock().set(cset);
      }
    }
  };

  return function ctor_display() {
    return new Display();
  };
});
