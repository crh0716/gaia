define(function(require) {
  'use strict';

  var Battery = require('modules/battery');

  var _refreshBatteryText = function(batteryDesc) {
    navigator.mozL10n.localize(batteryDesc,
      'batteryLevel-percent-' + Battery.state, { level: Battery.level });
  };

  var BatteryItem = function(itemElement) {
    this._enabled = false;
    this._itemElement = itemElement;
    this._refresh = _refreshBatteryText.bind(null, itemElement);
  };

  BatteryItem.prototype = {
    /**
     * The value indicates whether the module is responding.
     *
     * @access public
     * @memberOf BatteryItem.prototype
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
        Battery.observe('level', this._refresh);
        Battery.observe('state', this._refresh);
        this._refresh();
      } else {
        Battery.unobserve('level', this._refresh);
        Battery.unobserve('state', this._refresh);
      }
    }
  };

  return function ctor_batteryItem(itemElement) {
    return new BatteryItem(itemElement);
  };
});
