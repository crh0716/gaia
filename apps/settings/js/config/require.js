require.config({
  baseUrl: '/js',
  paths: {
    'modules': 'modules',
    'shared': '../shared/js'
  },
  shim: {
    'settings': {
      exports: 'Settings'
    },
    'shared/lazy_loader': {
      exports: 'LazyLoader'
    },
    'shared/keyboard_helper': {
      exports: 'KeyboardHelper'
    },
    'shared/manifest_helper': {
      exports: 'ManifestHelper'
    },
    'shared/screen_layout': {
      exports: 'ScreenLayout'
    }
  },
  modules: [
    {
      name: 'main'
    }
  ]
});
