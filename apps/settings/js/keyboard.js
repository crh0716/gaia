/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var DefaultKeyboardEnabledDialog = (function() {
  function showDialog(layout) {
    var l10n = navigator.mozL10n;
    l10n.localize(
      document.getElementById('keyboard-default-title'),
      'mustHaveOneKeyboard',
      {
        type: l10n.get('keyboardType-' +
          layout.inputManifest.types.sort()[0])
      }
    );
    l10n.localize(
      document.getElementById('keyboard-default-text'),
      'defaultKeyboardEnabled',
      {
        layoutName: layout.inputManifest.name,
        appName: layout.manifest.name
      }
    );
    openDialog('keyboard-enabled-default');
  }

  return {
    init: function() {
      KeyboardContext.defaultKeyboardEnabled(showDialog);
    },
    show: showDialog
  };
})();

navigator.mozL10n.ready(function keyboard_init() {
  KeyboardPanel.init('#keyboard');
  EnabledLayoutsPanel.init('#keyboard-selection');
  DefaultKeyboardEnabledDialog.init();
  InstalledLayoutsPanel.init('#keyboard-selection-addMore');
});
