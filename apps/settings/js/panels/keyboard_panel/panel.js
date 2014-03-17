/* globals define */
/**
 * In the panels we initialize a ListView with the data provided by
 * KeyboardContext. Templates for generating UI elements are also defined
 * here.
 */
define(['modules/settings_panel', 'modules/keyboard_context',
        'panels/keyboard_panel/core'],
  function(SettingsPanel, KeyboardContext, Core) {
    'use strict';

    return function ctor_keyboardPanel() {
      var core = Core(KeyboardContext);
      return SettingsPanel({
        onInit: core.onInit,
        onBeforeShow: core.onBeforeShow,
        onHide: core.onHide
      });
    };
});
