/* globals define */
/**
 * In the panels we initialize a ListView with the data provided by
 * KeyboardContext. Templates for generating UI elements are also defined
 * here.
 */
define(['modules/settings_service', 'modules/settings_panel',
        'modules/keyboard_context', 'shared/keyboard_helper',
        'modules/mvvm/list_view'],
  function(SettingsService, SettingsPanel,
           KeyboardContext, KeyboardHelper, ListView) {
    'use strict';

    return function ctor_addLayoutsPanel() {
      var _listViews = [];

      // A template function for generating an UI element for a layout object.
      var _layoutTemplate =
        function ksa_layoutTemplate(layout, recycled, helper) {
          var container = null;
          var span, checkbox;
          if (recycled) {
            container = recycled;
            checkbox = container.querySelector('input');
            span = container.querySelector('span');
          } else {
            container = document.createElement('li');
            checkbox = document.createElement('input');
            var label = document.createElement('label');
            span = document.createElement('span');

            label.className = 'pack-checkbox';
            checkbox.type = 'checkbox';

            label.appendChild(checkbox);
            label.appendChild(span);

            container.appendChild(label);
          }

          checkbox.onchange = function() {
            layout.enabled = this.checked;
          };

          helper.observeAndCall(layout, {
            name: function refreshName() {
              span.textContent = layout.name;
            },
            enabled: function() {
              checkbox.checked = layout.enabled;
            }
          });

          return container;
      };

      var _keyboardTemplate = function(keyboard, recycled, helper) {
        var container, header, h2, ul, listView;
        if (recycled) {
          container = recycled;
          h2 = container.querySelector('h2');
          ul = container.querySelector('ul');
        } else {
          container = document.createElement('div');
          header = document.createElement('header');
          h2 = document.createElement('h2');
          ul = document.createElement('ul');
          header.appendChild(h2);
          container.appendChild(header);
          container.appendChild(ul);
        }

        // if we find a listView for the ul, reuse it, otherwise create one
        listView = _listViews.some(function eachListView(list) {
          if (list.element === ul) {
            list.set(keyboard.layouts);
            list.enabled = true;
            return true;
          }
        });

        if (!listView) {
          listView = ListView(ul, keyboard.layouts, _layoutTemplate);
          listView.enabled = true;
          _listViews.push(listView);
        }

        helper.observeAndCall(keyboard, {
          name: function refreshName() {
            h2.textContent = keyboard.name;
          }
        });

        return container;
      };

      var _showEnabledDefaultDialog = function(layout) {
        SettingsService.navigate('keyboard-enabled-default', {
          layout: layout,
          origin: 'keyboard-selection-addMore'
        });
      };

      var _initInstalledLayoutListView = function(rootElement) {
        KeyboardContext.keyboards(function(keyboards) {
          var listView = ListView(
            rootElement.querySelector('.keyboardAppContainer'),
            keyboards,
            _keyboardTemplate
          );
          listView.enabled = true;
          _listViews.push(listView);
        });
      };

      return SettingsPanel({
        onInit: function kalp_onInit(rootElement) {
          KeyboardContext.init(function() {
            _initInstalledLayoutListView(rootElement);
          });
          KeyboardContext.defaultKeyboardEnabled(_showEnabledDefaultDialog);
        },
        onBeforeShow: function kalp_onBeforeShow() {
          if (_listViews) {
            _listViews.forEach(function(listView) {
              listView.enabled = true;
            });
          }
        },
        onBeforeHide: function kalp_onBeforeHide() {
          KeyboardHelper.saveToSettings(); // save changes to settings
        },
        onHide: function kalp_onHide() {
          if (_listViews) {
            _listViews.forEach(function(listView) {
              listView.enabled = false;
            });
          }
        }
      });
    };
});
