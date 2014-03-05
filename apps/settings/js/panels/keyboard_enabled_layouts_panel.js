/**
 * In the panels we initialize a ListView with the data provided by
 * KeyboardContext. Templates for generating UI elements are also defined
 * here.
 */
define(['modules/settings_panel', 'modules/keyboard_context',
        'modules/mvvm/list_view'],
  function(SettingsPanel, KeyboardContext, ListView) {
    'use strict';

    return function ctor_enabledLayoutsPanel() {
      var _listView = null;

      // A template function for generating an UI element for a keyboard object.
      var _layoutTemplate = function kelp_layoutTemplate(layout, recycled) {
        var container = null;
        var span;
        if (recycled) {
          container = recycled;
          span = container.querySelector('span');
        } else {
          container = document.createElement('li');
          span = document.createElement('span');
          container.appendChild(span);
        }
        var refreshName = function() {
          span.textContent = layout.appName + ': ' + layout.name;
        };
        refreshName();
        layout.observe('appName', refreshName);
        layout.observe('name', refreshName);
        return container;
      };

      var _initEnabledLayoutListView = function(rootElement) {
        KeyboardContext.enabledLayouts(function(enabledLayouts) {
          var ul = rootElement.querySelector('.enabledKeyboardList');
          _listView = ListView(ul, enabledLayouts, _layoutTemplate);
          _listView.enabled = true;
        });
      };

      return SettingsPanel({
        onInit: function kelp_onInit(rootElement) {
          KeyboardContext.init(function() {
            _initEnabledLayoutListView(rootElement);
          });
        },
        onBeforeShow: function kelp_onBeforeShow() {
          if (_listView) {
            _listView.enabled = true;
          }
        },
        onHide: function kelp_onHide() {
          if (_listView) {
            _listView.enabled = false;
          }
        }
      });
    };
});
