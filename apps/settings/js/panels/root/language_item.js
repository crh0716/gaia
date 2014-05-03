/* global getSupportedLanguages */
define(function(require) {
  'use strict';

  require('js/utils.js');

  var _refreshLanguageText = function(itemElement) {
    navigator.mozL10n.once(function() {
      var lang = navigator.mozL10n.language.code;

      // set the 'lang' and 'dir' attributes to <html>
      // when the page is translated
      document.documentElement.lang = lang;
      document.documentElement.dir = navigator.mozL10n.language.direction;

      // display the current locale in the main panel
      getSupportedLanguages(function displayLang(languages) {
        itemElement.textContent = languages[lang];
      });
    });
  };

  var LanguageItem = function(itemElement) {
    this._enabled = false;
    this._itemElement = itemElement;
    this._refresh = _refreshLanguageText.bind(null, itemElement);
  };

  LanguageItem.prototype = {
    /**
     * The value indicates whether the module is responding.
     *
     * @access public
     * @memberOf LanguageItem.prototype
     * @type {Boolean}
     */
    get enabled() {
      return this._enabled;
    },

    set enabled(value) {
      if (this._enabled === value) {
        return;
      }
      this._enabled = value;
      if (this._enabled) {
        window.addEventListener('localized', this._refresh);
        this._refresh();
      } else {
        window.removeEventListener('localized', this._refresh);
      }
    }
  };

  return function ctor_languageItem(itemElement) {
    return new LanguageItem(itemElement);
  };
});
