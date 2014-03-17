/* globals define */
define(['modules/mvvm/list_view', 'panels/keyboard_panel/keyboard_template'],
  function(ListView, keyboardTemplate) {
  'use strict';

  return function ctor_keyboardPanelCore(KeyboardContext) {
    return {
      _listView: null,
      _initAllKeyboardListView: function kp_initListView(rootElement) {
        KeyboardContext.keyboards((function(keyboards) {
          var ul = rootElement.querySelector('.allKeyboardList');
          ul.hidden = (keyboards.length === 0);
          this._listView = ListView(ul, keyboards, keyboardTemplate);
          this._listView.enabled = true;
        }).bind(this));
      },
      onInit: function kp_onInit(rootElement) {
        KeyboardContext.init(function() {
          this._initAllKeyboardListView(rootElement);
        });
      },
      onBeforeShow: function kp_onBeforeShow() {
        if (this._listView) {
          this._listView.enabled = true;
        }
      },
      onHide: function kp_onHide() {
        if (this._listView) {
          this._listView.enabled = false;
        }
      }
    };
  };
});
