/* global loadJSON */
/**
 * The display panel allow user to modify timeout forscreen-off, brightness, and
 * change wallpaper.
 */
define(function(require) {
  'use strict';

  var SettingsPanel = require('modules/settings_panel');
  var DisplayModule = require('panels/display/display');
  var WallpaperModule = require('panels/display/wallpaper');
  var wallpaperElements = {};
  var displayElements = {};
  var sensorResourceHasLoaded = false;

  return function ctor_display_panel() {
    var display = DisplayModule();
    var wallpaper = WallpaperModule();
    var eventMapping = [
      {
        elementName: 'wallpaperPreview',
        eventType: 'click',
        methodName: 'onWallpaperClick'
      },
      {
        elementName: 'wallpaperButton',
        eventType: 'click',
        methodName: 'onWallpaperClick'
      }
    ];

    function bindEvents(elements) {
      eventMapping.forEach(function(map) {
        map.method = wallpaper[map.methodName].bind(wallpaper);
        elements[map.elementName].addEventListener(map.eventType,
          map.method);
      });
    }

    return SettingsPanel({
      onInit: function dp_onInit(panel) {
        displayElements = {
          brightnessManual: panel.querySelector('.brightness-manual'),
          brightnessAuto: panel.querySelector('.brightness-auto')
        };
        wallpaperElements = {
          wallpaperPreview: panel.querySelector('.wallpaper-preview'),
          wallpaperButton: panel.querySelector('.wallpaper-button')
        };
        display.init(displayElements);
        wallpaper.init(wallpaperElements);
        bindEvents(wallpaperElements);
      },

      onBeforeShow: function dp_onBeforeShow(rootElement) {
        if (!sensorResourceHasLoaded) {
          loadJSON(['/resources/sensors.json'], function(data) {
            sensorResourceHasLoaded = true;
            display.sensorStart(data);
          });
        }
      }
    });
  };
});
