/* global MozActivity */
define(function(require) {
  'use strict';

  var SettingsListener = require('shared/settings_listener');
  var SettingsCache = require('modules/settings_cache');
  var SettingsURL = require('shared/settings_url');
  var ForwardLock = require('shared/omadrm/fl');
  var Wallpaper = function() {
    this.elements = null;
    this.wallpaperURL = new SettingsURL();
  };

  Wallpaper.prototype = {
    init: function w_init(elements) {
      this.elements = elements;
      this._watchWallpaperChange();
      this.loadCurrentWallpaper();
    },

    _watchWallpaperChange: function w__watch_wallpaper_change() {
      SettingsListener.observe('wallpaper.image', false,
        function onHomescreenchange(value) {
          this.elements.wallpaperPreview.src =
            this.wallpaperURL.set(value);
      }.bind(this));
    },

    loadCurrentWallpaper: function w_load_current_wallpaper() {
      this.elements.wallpaperPreview.src =
        this.wallpaperURL.set(SettingsCache.cache['wallpaper.image']);
    },

    onWallpaperClick: function w_on_wallpaper_click() {
      ForwardLock.getKey(this._onWallpaperClick.bind(this));
    },

    _onWallpaperClick: function w__on_wallpaper_click(secret) {
      this.secret = secret;
      this.mozActivity = new MozActivity({
        name: 'pick',
        data: {
          type: ['wallpaper', 'image/*'],
          includeLocked: (secret !== null),
          // XXX: This will not work with Desktop Fx / Simulator.
          width: window.screen.width * window.devicePixelRatio,
          height: window.screen.height * window.devicePixelRatio
        }
      });
      this.mozActivity.onsuccess = this._onPickSuccess.bind(this);
      this.mozActivity.onerror = this._onPickError;
    },

    _onPickSuccess: function w__on_pick_success() {
      var blob = this.mozActivity.result.blob;
      if (!blob) {
        return;
      }
      if (blob.type.split('/')[1] === ForwardLock.mimeSubtype) {
        // If this is a locked image from the locked content app, unlock it
        ForwardLock.unlockBlob(this.secret, blob, function(unlocked) {
          this._setWallpaper(unlocked);
        }.bind(this));
      } else {
        this._setWallpaper(blob);
      }
    },

    _setWallpaper: function w__set_wallpaper(value) {
      SettingsListener.getSettingsLock().set({
        'wallpaper.image': value
      });
    },

    _onPickError: function w__on_pick_error() {
      console.warn('pick failed!');
    }
  };
  return function ctor_wallpaper() {
    return new Wallpaper();
  };
});
