define(['modules/settings_service', 'modules/settings_panel'],
  function(SettingsService, SettingsPanel) {
    'use strict';

    return function ctor_keyboardPanel() {
      return SettingsPanel({
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
      });
    };
});
