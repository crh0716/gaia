define(['modules/settings_panel', 'modules/settings_service'],
  function(SettingsPanel, SettingsService) {
    'use strict';

    var options = {
      onBeforeShow: function ked_onBeforeShow(rootElement, options) {
        var layout = options.layout;
        navigator.mozL10n.ready(function ked_show() {
          var l10n = navigator.mozL10n;
          l10n.localize(
            rootElement.querySelector('.keyboard-default-title'),
            'mustHaveOneKeyboard',
            {
              type: l10n.get('keyboardType-' +
                layout.inputManifest.types.sort()[0])
            }
          );
          l10n.localize(
            rootElement.querySelector('.keyboard-default-text'),
            'defaultKeyboardEnabled',
            {
              layoutName: layout.inputManifest.name,
              appName: layout.manifest.name
            }
          );

          rootElement.querySelector('button[type="submit"]').onclick =
            function onsubmit() {
              SettingsService.navigate(options.origin);
          };
        });
      }
    };

    return function ctor_keyboardEnabledDefaultDialog() {
      return SettingsPanel(options);
    };
});
