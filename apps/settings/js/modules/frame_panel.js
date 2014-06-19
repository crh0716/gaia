/**
 * @module FramePanel
 */
define(function(require) {
    'use strict';

    var Panel = require('modules/panel');
    var SettingsService = require('modules/settings_service');

    /**
     * @alias module:FramePanel
     * @param {Object} options
     *                 Options are used to override the internal functions of
     *                 Panel.
     * @returns {FramePanel}
     */
    var FramePanel = function ctor_FramePanel() {
      /**
       * The root element of the panel.
       *
       * @type {HTMLElement}
       */
      var _panel = null;
      var _frame = null;

      return Panel({
        onInit: function(panel, initOptions) {
          if (!panel) {
            return;
          }

          _panel = panel;
        },
        onUninit: function() {
          _panel = null;
        },
        onShow: function(panel, showOptions) {},
        onHide: function() {
          _panel.removeChild(_frame);
          _frame = null;
        },
        onBeforeShow: function(panel, beforeShowOptions) {
          _frame = document.createElement('iframe');
          _frame.setAttribute('mozapp',
            'app://keyboard.gaiamobile.org/manifest.webapp');
          _frame.setAttribute('mozbrowser', true);
          _frame.src = 'app://keyboard.gaiamobile.org/settings.html';

          panel.appendChild(_frame);
          _frame.addEventListener('mozbrowserclose', function onclose() {
            _frame.removeEventListener('mozbrowserclose', onclose);
            SettingsService.navigate('root');
          });
        }
      });
    };
    return FramePanel;
});
