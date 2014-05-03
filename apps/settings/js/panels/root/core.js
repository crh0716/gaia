/* global TelephonySettingHelper */
/**
 * Handle root panel functionality
 */
define(function(require) {
  'use strict';

  var LazyLoader = require('shared/lazy_loader');

  var RootCore = function() {};

  RootCore.prototype = {
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
        /**
         * Enable or disable the menu items related to the ICC card
         * relying on the card and radio state.
         */
        LazyLoader.load([
          'shared/js/wifi_helper.js',
          'js/firefox_accounts/menu_loader.js',
          'shared/js/airplane_mode_helper.js',
          'js/airplane_mode.js',
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
    }
  };

  return function ctor_rootCore() {
    return new RootCore();
  };
});
