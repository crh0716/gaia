/**
 * In the panels we initialize a ListView with the data provided by
 * KeyboardContext. Templates for generating UI elements are also defined
 * here.
 */
define(['modules/settings_panel', 'modules/keyboard_context',
        'modules/mvvm/list_view'],
  function(SettingsPanel, KeyboardContext, ListView) {
    'use strict';

    return function ctor_keyboardPanel() {
      var _listView = null;

      // A template function for generating an UI element for a keyboard object.
      var _keyboardTemplate = function kp_keyboardTemplate(keyboard, recycled) {
        var container = null;
        var span;
        if (recycled) {
          container = recycled;
          span = container.querySelector('span');
        } else {
          container = document.createElement('li');
          span = document.createElement('span');

          container.classList.add('keyboard-menuItem');
          container.appendChild(span);
        }

        container.onclick = function() {
          keyboard.app.launch();
        };
        span.textContent = keyboard.name;
        return container;
      };

      var _initAllKeyboardListView = function(rootElement) {
        KeyboardContext.keyboards(function(keyboards) {
          var ul = rootElement.querySelector('.allKeyboardList');
          ul.hidden = (keyboards.length === 0);
          _listView = ListView(ul, keyboards, _keyboardTemplate);
          _listView.enabled = true;
        });
      };

      return SettingsPanel({
        onInit: function kp_onInit(rootElement) {
          KeyboardContext.init(function() {
            _initAllKeyboardListView(rootElement);
          });
        },
        onBeforeShow: function kp_onBeforeShow() {
          if (_listView) {
            _listView.enabled = true;
          }
        },
        onHide: function kp_onHide() {
          if (_listView) {
            _listView.enabled = false;
          }
        }
      });
    };
});
