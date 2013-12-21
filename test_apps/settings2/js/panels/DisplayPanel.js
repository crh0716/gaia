define('panels/DisplayPanel',
  ['modules/Panel', 'modules/Wallpaper', 'modules/Utils'],
  function(Panel, Wallpaper, Utils) {
    var ready = function(rootElement, options) {
      var panel = rootElement;
      var settings = navigator.mozSettings;
      if (!settings || !panel)
        return;

      var manualBrightness = panel.querySelector('#brightness-manual');
      var autoBrightness = panel.querySelector('#brightness-auto');
      var autoBrightnessSetting = 'screen.automatic-brightness';

      // hide "Adjust automatically" if there's no ambient light sensor --
      // until bug 876496 is fixed, we have to read the `sensors.json' file to
      // be sure this ambient light sensor is enabled.
      Utils.loadJSON('/resources/sensors.json',
        function loadSensors(activeSensors) {
          if (activeSensors.ambientLight) { // I can haz ambient light sensor
            autoBrightness.hidden = false;
            settings.addObserver(autoBrightnessSetting, function(event) {
              manualBrightness.hidden = event.settingValue;
            });
            var req = settings.createLock().get(autoBrightnessSetting);
            req.onsuccess = function brightness_onsuccess() {
              manualBrightness.hidden = req.result[autoBrightnessSetting];
            };
          } else { // no ambient light sensor: force manual brightness setting
            autoBrightness.hidden = true;
            manualBrightness.hidden = false;
            var cset = {};
            cset[autoBrightnessSetting] = false;
            settings.createLock().set(cset);
          }
      });
    };

    Wallpaper.init();

    return Panel(ready);
});
