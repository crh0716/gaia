/**
 * @fileoverview navigate between panels.
 */
define('modules/SettingsService',
  ['modules/PageTransitions', 'modules/PanelCache', 'LazyLoader'],
  function(PageTransitions, PanelCache, LazyLoader) {
    'use strict';
    var _currentPanelId = null;
    var _currentPanel = null;

    var _navigate = function ss_navigate(panelId, options) {
      _loadPanel(panelId, function() {
        var newPanelElement = document.getElementById(panelId);
        var currentPanelElement =
            _currentPanelId ? document.getElementById(_currentPanelId) : null;

        PanelCache.get(panelId, function(panel) {
          // Prepare options and calls to the panel object's ready function.
          options = options || {};
          panel.ready(newPanelElement, options);

          // Do transition
          PageTransitions.oneColumn(currentPanelElement, newPanelElement);

          // Update info
          _currentPanelId = panelId;
          if (_currentPanel) {
            _currentPanel.done();
          }
          _currentPanel = panel;
        });
      });
    };

    var _loadPanel = function ss_loadPanel(panelId, callback) {
      var panelElement = document.getElementById(panelId);
      if (panelElement.dataset.rendered) { // already initialized
        callback();
        return;
      }
      panelElement.dataset.rendered = true;
      LazyLoader.load([panelElement], callback);
    };

    return {
      navigate: _navigate
    };
});
