/* global MozActivity */
define(function(require) {
  'use strict';

  var SettingsListener = require('shared/settings_listener');
  var SettingsURL = require('shared/settings_url');
  var ForwardLock = require('shared/omadrm/fl');
  var Observable = require('modules/mvvm/observable');

  // This is used to construct the observable object, in which we have one
  // public property to be observed (wallpaperSrc) and one public
  // function (selectWallpaper).
  var wallpaperPrototype = {
    _init: function w_init() {
      this.wallpaperURL = new SettingsURL();
      this._watchWallpaperChange();
    },

    _watchWallpaperChange: function w__watch_wallpaper_change() {
      SettingsListener.observe('wallpaper.image', '',
        function onHomescreenchange(value) {
          this.wallpaperSrc = this.wallpaperURL.set(value);
      }.bind(this));
    },

    _triggerActivity: function w__on_wallpaper_click(secret) {
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
    },

    wallpaperSrc: '',
    selectWallpaper: function w_on_wallpaper_click() {
      ForwardLock.getKey(this._triggerActivity.bind(this));
    },
  };

  return function ctor_wallpaper() {
    // Create the observable object using the prototype.
    var wallpaper = Observable(wallpaperPrototype);
    wallpaper._init();

    return wallpaper;
  };
});
