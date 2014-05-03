require.config({
  baseUrl: '/js',
  paths: {
    'modules': 'modules',
    'panels': 'panels',
    'shared': '../shared/js'
  },
  shim: {
    'shared/async_storage': {
      exports: 'AsyncStorage'
    },
    'shared/keyboard_helper': {
      exports: 'KeyboardHelper'
    },
    'shared/lazy_loader': {
      exports: 'LazyLoader'
    },
    'shared/manifest_helper': {
      exports: 'ManifestHelper'
    },
    'shared/screen_layout': {
      exports: 'ScreenLayout'
    },
    'settings': {
      exports: 'Settings'
    },
    'shared/settings_listener': {
      exports: 'SettingsListener'
    },
    'utils': {
      exports: ''
    }
  },
  modules: [
    {
      name: 'main'
    },
    {
      name: 'panels/languages/panel',
      exclude: [
        'main',
        'shared/keyboard_helper'
      ]
    },
    {
      name: 'panels/send_feedback/panel',
      exclude: ['main']
    },
    {
      name: 'panels/choose_feedback/panel',
      exclude: ['main']
    },
    {
      name: 'panels/help/panel',
      exclude: ['main']
    },
    {
      name: 'panels/app_permissions_detail/panel',
      exclude: ['main']
    },
    {
      name: 'panels/app_permissions_list/panel',
      exclude: ['main']
    },
    {
      name: 'panels/screen_lock/panel',
      exclude: ['main']
    },
    {
      name: 'panels/screen_lock_passcode/panel',
      exclude: ['main']
    },
    {
      name: 'panels/root/panel',
      exclude: ['main']
    }
  ]
});
