'use strict';
mocha.globals([
  'MockSettingsListener',
  'SettingsListener'
]);

suite('start testing > ', function() {
  var DisplayContrustor;

  var mockSettingsListener;

  var mockElements;
  suiteSetup(function(done) {
    var modules = [
      'shared_mocks/mock_settings_listener',
      'panels/display/display'
    ];
    var maps = {
      'panels/display/display': {
        'shared/settings_listener': 'shared_mocks/mock_settings_listener'
      }
    };
    testRequire(modules, maps, function(MockSettingsListener, Display) {
        mockSettingsListener = MockSettingsListener;
        DisplayContrustor = Display;
        done();
    });
    mockElements = {
      brightnessAuto: {},
      brightnessManual: {}
    };
  });
  suite('start test display module > ', function() {
    var display;
    setup(function() {
      display = DisplayContrustor();
    });

    test('sensorStart with ambientLight', function() {
      var brightnessValue = true;
      var config = {
        ambientLight: true
      };
      display.elements = mockElements;
      display.sensorStart(config);
      mockSettingsListener.mTriggerCallback('screen.automatic-brightness',
        brightnessValue);
      assert.equal(mockElements.brightnessAuto.hidden, false);
      assert.equal(mockElements.brightnessManual.hidden, brightnessValue);
    });

    test('sensorStart without ambientLight', function() {
      var config = {};
      display.elements = mockElements;
      display.sensorStart(config);
      assert.equal(mockElements.brightnessAuto.hidden, true);
      assert.equal(mockElements.brightnessManual.hidden, false);

      assert.deepEqual(mockSettingsListener.getSettingsLock().locks[0], {
        'screen.automatic-brightness': false
      });
    });
  });
});
