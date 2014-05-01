(function(exports) {
  'use strict';

  var _defaultPanelID = 'root';
  var _currentActivity = null;

  Object.defineProperty(exports, 'DEFAULT_PANEL_ID', {
    configurable: false,
    get: function() { return _defaultPanelID; }
  });

  Object.defineProperty(exports, 'currentActivity', {
    configurable: false,
    get: function() { return _currentActivity; }
  });

  /**
   * Load alameda and the required modules defined in main.js.
   */
  function loadScripts() {
    var scriptNode = document.createElement('script');
    scriptNode.setAttribute('data-main', 'js/main.js');
    scriptNode.src = 'js/vendor/alameda.js';
    document.head.appendChild(scriptNode);
  }

  function webActivityHandler(activityRequest) {
    var name = activityRequest.source.name;
    // If there isn't a section specified,
    // simply show ourselve without making ourselves a dialog.
    if (name === 'configure' && activityRequest.source.data.section) {
      _defaultPanelID = activityRequest.source.data.section;
      _currentActivity = activityRequest;
    }

    // Validate if the section exists
    var defaultPanel = document.getElementById(_defaultPanelID);
    if (!defaultPanel || defaultPanel.tagName !== 'SECTION') {
      var msg = 'Trying to open an non-existent section: ' + _defaultPanelID;
      console.warn(msg);
      activityRequest.postError(msg);
      return;
    } else if (_defaultPanelID === 'root') {
      var filterBy = activityRequest.source.data.filterBy;
      if (filterBy) {
        document.body.dataset.filterBy = filterBy;
      }
    }

    showPlaceholderAndDefaultPanel();
  }

  function showPlaceholderAndDefaultPanel() {
    var placeholderTitle = document.querySelector('#placeholder h1');
    var defaultPanel = document.getElementById(_defaultPanelID);

    navigator.mozL10n.once(function() {
      LazyLoader.load([defaultPanel], function() {
        var defaultPanelTitle = defaultPanel.querySelector('header h1');
        navigator.mozL10n.translate(defaultPanel);
        // Set the title of the place holder so that we can show it to users
        // as soon as possible.
        navigator.mozL10n.localize(placeholderTitle,
          defaultPanelTitle.dataset.l10nId);
        defaultPanel.dataset.rendered = true;
        defaultPanel.classList.add('current');

        loadScripts();

        // activate the animation
        setTimeout(function nextTick() {
          document.body.dataset.ready = true;
        });
      });
    });
  }

  window.addEventListener('load', function loaded() {
    window.removeEventListener('load', loaded);
    if (navigator.mozHasPendingMessage('activity')) {
      navigator.mozSetMessageHandler('activity', webActivityHandler);
    } else {
      showPlaceholderAndDefaultPanel();
    }
  });
}(this));
dump('=== perf: startup');
