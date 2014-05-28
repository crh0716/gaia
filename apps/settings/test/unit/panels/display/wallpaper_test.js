'use strict';
mocha.globals([
  'MockSettingsListener',
  'MockSettingsURL',
  'MockForwardLock',
  'MockSettingsCache',
  'SettingsListener',
  'MozActivity'
]);

suite('start testing > ', function() {
  var WallpaperContrustor;

  var mockSettingsListener,
      mockSettingsCache,
      mockSettingsURL,
      mockForwardLock,
      mockMozActivity;

  var realMozActivity;

  var mockElements;

  suiteSetup(function(done) {
    var modules = [
      'shared_mocks/mock_settings_listener',
      'unit/mock_settings_url',
      'unit/mock_omadrm_fl',
      'unit/mock_settings_cache',
      'unit/mock_moz_activity',
      'panels/display/wallpaper'
    ];

    var maps = {
      'panels/display/wallpaper': {
        'shared/settings_listener': 'shared_mocks/mock_settings_listener',
        'modules/settings_cache': 'unit/mock_settings_cache',
        'shared/settings_url': 'unit/mock_settings_url',
        'shared/omadrm/fl': 'unit/mock_omadrm_fl'
      }
    };
    testRequire(modules, maps, function(MockSettingsListener, MockSettingsURL,
      MockForwardLock, MockSettingsCache, MockMozActivity, Wallpaper) {
        mockSettingsListener = MockSettingsListener;
        mockSettingsCache = MockSettingsCache;
        mockSettingsURL = MockSettingsURL;
        mockForwardLock = MockForwardLock;
        realMozActivity = window.MozActivity;
        mockMozActivity = MockMozActivity;
        window.MozActivity = mockMozActivity.constr;
        WallpaperContrustor = Wallpaper;
        done();
    });

    mockElements = {
      wallpaperPreview: {}
    };
  });

  suiteTeardown(function() {
    window.MozActivity = realMozActivity;
  });

  suite('start test wallpaper module > ', function() {
    var wallpaper;
    setup(function() {
      wallpaper = WallpaperContrustor();
    });

    test('init', function() {
      this.sinon.stub(wallpaper, 'loadCurrentWallpaper');
      this.sinon.stub(wallpaper, '_watchWallpaperChange');
      wallpaper.init(mockElements);
      assert.equal(wallpaper.loadCurrentWallpaper.called, 1);
      assert.equal(wallpaper._watchWallpaperChange.called, 1);
    });

    test('_watchWallpaperChange', function() {
      var testSrc = 'test';
      wallpaper.elements = mockElements;
      wallpaper._watchWallpaperChange();
      mockSettingsListener.mTriggerCallback('wallpaper.image', testSrc);
      assert.equal(mockElements.wallpaperPreview.src, testSrc);
    });

    test('loadCurrentWallpaper', function() {
      var testSrc = 'test';
      wallpaper.elements = mockElements;
      mockSettingsCache.mockSettings({'wallpaper.image': testSrc});
      wallpaper.loadCurrentWallpaper();
      assert.equal(mockElements.wallpaperPreview.src, testSrc);
    });

    test('onWallpaperClick', function() {
      this.sinon.stub(wallpaper, '_onWallpaperClick');
      wallpaper.onWallpaperClick();
      assert.equal(wallpaper._onWallpaperClick.called, 1);
    });

    test('_onWallpaperClick', function() {
      this.sinon.stub(wallpaper, '_onPickSuccess');
      this.sinon.stub(wallpaper, '_onPickError');
      var secret = !null;
      wallpaper._onWallpaperClick(secret);
      mockMozActivity.mConstr.mTriggerOnSuccess();
      assert.equal(wallpaper._onPickSuccess.called, 1);

      mockMozActivity.mConstr.mTriggerOnError();
      assert.equal(wallpaper._onPickError.called, 1);
    });

    test('_onPickSuccess', function() {
      var unlocked = true;
      mockForwardLock.mSetupMimeSubtype('mimeSubtype');
      wallpaper.mozActivity = new mockMozActivity.constr();
      mockForwardLock.mSetupUnlocked(unlocked);
      mockMozActivity.mConstr.mSetupData({
        blob: {
          type: 'test/mimeSubtype'
        }
      });
      this.sinon.stub(wallpaper, '_setWallpaper');
      wallpaper._onPickSuccess();
      assert.equal(wallpaper._setWallpaper.called, 1);
      assert.equal(wallpaper._setWallpaper.lastCall.args[0], unlocked);
    });

    test('_setWallpaper', function() {
      var blob = 'testblob';
      wallpaper._setWallpaper(blob);
      assert.deepEqual(mockSettingsListener.getSettingsLock().locks[0], {
        'wallpaper.image': 'testblob'
      });
    });
  });
});
