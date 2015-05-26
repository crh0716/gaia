/* global threads */
'use strict';

/*
var RequireService = threads.client('require-service');
RequireService.method('require', 'modules/battery').then((Battery) => {
  var BatteryService = threads.service('battery-service')
    .method('level', function() {
      return Battery.level;
    })
    .method('state', function() {
      return Battery.state;
    });

  ['level', 'state'].forEach(name => {
    Battery.observe(name, function(value) {
      BatteryService.broadcast('propertychange', {
        name: name,
        value: value
      });
    });
  });
});
*/

var NavigatorBattery = navigator.battery;
var _getLevel = function b_getLevel() {
  return Math.min(100, Math.round(NavigatorBattery.level * 100));
};
var _getState = function b_getState() {
  if (NavigatorBattery.charging) {
    return (_getLevel() == 100) ? 'charged' : 'charging';
  } else {
    return 'unplugged';
  }
};

var Battery = {};
var BatteryService = threads.service('battery-service')
  .method('level', function() {
    return Battery.level;
  })
  .method('state', function() {
    return Battery.state;
  });

['level', 'state'].forEach(function(name) {
  var internalName = '_' + name;
  this[internalName] = null;
  Object.defineProperty(this, name, {
    get: function() { 
      return this[internalName];
    },
    set: function(value) {
      if (this[internalName] !== value) {
        this[internalName] = value;
        BatteryService.broadcast('propertychange', {
          name: name,
          value: value
        });
      }
    }
  });
}, Battery);

Battery._level = _getLevel();
Battery._state = _getState();

NavigatorBattery.addEventListener('levelchange', function b_level() {
  Battery.level = _getLevel();
});
NavigatorBattery.addEventListener('chargingchange', function b_charging() {
  Battery.state = _getState();
});
