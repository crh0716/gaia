/* global TelephonySettingHelper, getSupportedLanguages */
/**
 * Handle root panel functionality
 */
define(function(require) {
  'use strict';

  var LazyLoader = require('shared/lazy_loader');

  var Root = function() {};

  Root.prototype = {
    init: function root_init() {
      // hide telephony panels
      if (!navigator.mozTelephony) {
        var elements = ['call-settings',
                        'data-connectivity',
                        'messaging-settings',
                        'simSecurity-settings'];
        elements.forEach(function(el) {
          document.getElementById(el).hidden = true;
        });
      }

      // hide unused panel
      if (navigator.mozMobileConnections) {
        if (navigator.mozMobileConnections.length == 1) { // single sim
          document.getElementById('simCardManager-settings').hidden = true;
        } else { // dsds
          document.getElementById('simSecurity-settings').hidden = true;
        }
      }

      setTimeout((function nextTick() {
        LazyLoader.load(['js/utils.js'], function() {
          this.startupLocale();
        }.bind(this));

        /**
         * Enable or disable the menu items related to the ICC card
         * relying on the card and radio state.
         */
        LazyLoader.load([
          'shared/js/wifi_helper.js',
          'js/firefox_accounts/menu_loader.js',
          'shared/js/airplane_mode_helper.js',
          'js/airplane_mode.js',
          'js/battery.js',
          'shared/js/async_storage.js',
          'js/storage.js',
          'js/try_show_homescreen_section.js',
          'shared/js/mobile_operator.js',
          'shared/js/icc_helper.js',
          'shared/js/settings_listener.js',
          'shared/js/toaster.js',
          'js/connectivity.js',
          'js/security_privacy.js',
          'js/icc_menu.js',
          'js/nfc.js',
          'js/dsds_settings.js',
          'js/telephony_settings.js',
          'js/telephony_items_handler.js',
          'js/screen_lock.js'
        ], function() {
          TelephonySettingHelper.init();
        });
      }).bind(this));
    },

    // startup & language switching
    startupLocale: function root_startupLocale() {
      // XXX change to mozL10n.ready when https://bugzil.la/993188 is fixed
      navigator.mozL10n.once(function startupLocale() {
        this.initLocale();
        window.addEventListener('localized', this.initLocale);
      }.bind(this));
    },

    initLocale: function root_initLocale() {
      var lang = navigator.mozL10n.language.code;

      // set the 'lang' and 'dir' attributes to <html>
      // when the page is translated
      document.documentElement.lang = lang;
      document.documentElement.dir = navigator.mozL10n.language.direction;

      // display the current locale in the main panel
      getSupportedLanguages(function displayLang(languages) {
        document.getElementById('language-desc').textContent = languages[lang];
      });
    }
  };

  return function ctor_root() {
    return new Root();
  };
});
