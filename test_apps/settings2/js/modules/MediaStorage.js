'use strict';

define('modules/MediaStorage', ['modules/Volume', 'modules/SettingsCache'],
  function(Volume, SettingsCache) {
    /**
     * The whole purpose of this code is to detect when we're in the state of
     * having the UMS Enabled checkbox unchecked, but the SD-card is still being
     * shared with the PC.
     *
     * In this case, the user has to unplug the USB cable in order to actually
     * turn off UMS, and we put some text to that effect on the settings screen.
     */
    const MEDIA_TYPE = ['music', 'pictures', 'videos', 'sdcard'];
    const ITEM_TYPE = ['music', 'pictures', 'videos', 'free'];

    return function ctor_MediaStorage() {
      return {
        init: function ms_init(rootElement) {
          this._rootElement = rootElement;
          this._volumeList = this.initAllVolumeObjects();

          this.documentStorageListener = false;
          this.updateListeners();

          this.usmEnabledVolume = {};
          this.umsVolumeShareState = false;
          // Use visibilitychange so that we don't get notified of device
          // storage notifications when the settings app isn't visible.
          document.addEventListener('visibilitychange', this);
          this.umsEnabledCheckBox = rootElement.querySelector('#ums-switch');
          this.umsEnabledInfoBlock = rootElement.querySelector('#ums-desc');
          this.umsEnabledCheckBox.addEventListener('change', this);
          this.registerUmsListener();

          var self = this;
          var umsSettingKey = 'ums.enabled';
          SettingsCache.getSettings(function(allSettings) {
            self.umsEnabledCheckBox.checked =
              allSettings[umsSettingKey] || false;
            self.updateMasterUmsDesc();
          });
          navigator.mozSettings.addObserver(umsSettingKey, function(evt) {
            self.umsEnabledCheckBox.checked = evt.settingValue;
            self.updateMasterUmsDesc();
          });

          this.defaultMediaLocation =
            rootElement.querySelector('#defaultMediaLocation');
          this.defaultMediaLocation.addEventListener('click', this);
          this.makeDefaultLocationMenu();

          window.addEventListener('localized', this);

          this.updateInfo();
        },

        initAllVolumeObjects: function ms_initAllVolumeObjects() {
          var volumes = {};
          var totalVolumes = 0;
          MEDIA_TYPE.forEach(function(type) {
            var storages = navigator.getDeviceStorages(type);
            storages.forEach(function(storage) {
              var name = storage.storageName;
              if (!volumes.hasOwnProperty(name)) {
                volumes[name] = {};
                totalVolumes++;
              }
              volumes[name][type] = storage;
            });
          });

          var volumeList = [];
          var externalIndex = 0;
          var volumeListRootElement =
            this._rootElement.querySelector('#volume-list');
          for (var name in volumes) {
            var volume;
            // XXX: This is a heuristic to determine whether a storage is
            // internal or external (e.g. a pluggable SD card). It does *not*
            // work in general, but it works for all officially-supported
            // devices.
            if (totalVolumes > 1 && name === 'sdcard') {
              volume = new Volume(name, false /* internal */, 0, volumes[name]);
            } else {
              volume = new Volume(name, true /* external */, externalIndex++,
                                  volumes[name]);
            }
            volume.createView(volumeListRootElement);
            volumeList.push(volume);
          }
          return volumeList;
        },

        registerUmsListener: function ms_registerUmsListener() {
          var self = this;
          var settings = navigator.mozSettings;
          this._volumeList.forEach(function(volume, index) {
            var key = 'ums.volume.' + volume.name + '.enabled';
            SettingsCache.getSettings(function(allSettings) {
              var input =
                self._rootElement.querySelector('input[name="' + key + '"]');
              input.checked = allSettings[key] || false;
              self.usmEnabledVolume[index] = input.checked;
              self.updateMasterUmsDesc();
            });
            settings.addObserver(key, function(evt) {
              self.usmEnabledVolume[index] = evt.settingValue;
              self.updateMasterUmsDesc();
            });
          });
        },

        updateMasterUmsDesc: function ms_updateMasterUmsDesc() {
          var _ = navigator.mozL10n.get;
          if (this.umsEnabledCheckBox.checked) {
            var list = [];
            for (var id in this.usmEnabledVolume) {
              if (this.usmEnabledVolume[id]) {
                list.push(_(this._volumeList[id].getL10nId(true)));
              }
            }
            if (list.length === 0) {
              this.umsEnabledInfoBlock.textContent = _('enabled');
              this.umsEnabledInfoBlock.dataset.l10nId = 'enabled';
            } else {
              var desc = _('ums-shared-volumes', { list: list.join(', ') });
              this.umsEnabledInfoBlock.textContent = desc;
              this.umsEnabledInfoBlock.dataset.l10nId = '';
            }
          } else if (this.umsVolumeShareState) {
            this.umsEnabledInfoBlock.textContent = _('umsUnplugToDisable');
            this.umsEnabledInfoBlock.dataset.l10nId = 'umsUnplugToDisable';
          } else {
            this.umsEnabledInfoBlock.textContent = _('disabled');
            this.umsEnabledInfoBlock.dataset.l10nId = 'disabled';
          }
        },

        handleEvent: function ms_handleEvent(evt) {
          switch (evt.type) {
            case 'localized':
              this.updateInfo();
              break;
            case 'change':
              if (evt.target.id === 'ums-switch') {
                Storage.umsMasterSettingChanged(evt);
              } else {
                // we are handling storage state changes
                // possible state: available, unavailable, shared
                this.updateInfo();
              }
              break;
            case 'click':
              this.changeDefaultStorage();
              break;
            case 'visibilitychange':
              this.updateListeners(this.updateInfo.bind(this));
              break;
          }
        },

        makeDefaultLocationMenu: function ms_makeDefaultLocationMenu() {
          var _ = navigator.mozL10n.get;
          var self = this;
          var defaultMediaVolumeKey = 'device.storage.writable.name';
          SettingsCache.getSettings(function(allSettings) {
            var defaultName = allSettings[defaultMediaVolumeKey];
            var selectionMenu = self.defaultMediaLocation;
            var selectedIndex = 0;
            self._volumeList.forEach(function(volume, index) {
              var option = document.createElement('option');
              option.value = volume.name;
              var l10nId = volume.getL10nId(true);
              option.dataset.l10nId = l10nId;
              option.textContent = _(l10nId);
              selectionMenu.appendChild(option);
              if (defaultName && volume.name === defaultName) {
                selectedIndex = index;
              }
            });
            var selectedOption = selectionMenu.options[selectedIndex];
            selectedOption.selected = true;

            // disable option menu if we have only one option
            if (self._volumeList.length === 1) {
              selectionMenu.disabled = true;
              var obj = {};
              obj[defaultMediaVolumeKey] = selectedOption.value;
              navigator.mozSettings.createLock().set(obj);
            }
          });
        },
        changeDefaultStorage: function ms_changeDefaultStorage() {
          //Pop up a confirm window before listing options.
          var popup =
            this._rootElement.querySelector(
              '#default-location-popup-container');
          var cancelBtn =
            this._rootElement.querySelector('#default-location-cancel-btn');
          var changeBtn =
            this._rootElement.querySelector('#default-location-change-btn');

          this.defaultMediaLocation.blur();
          var self = this;
          popup.hidden = false;
          cancelBtn.onclick = function() {
            popup.hidden = true;
          };
          changeBtn.onclick = function() {
            popup.hidden = true;
            setTimeout(function() {
              self.defaultMediaLocation.focus();
            });
          };
        },

        updateListeners: function ms_updateListeners(callback) {
          var self = this;
          if (document.hidden) {
            // Settings is being hidden. Unregister our change listener so we
            // won't get notifications whenever files are added in another app.
            if (this.documentStorageListener) {
              this._volumeList.forEach(function(volume) {
                // use sdcard storage to represent this volume
                var volumeStorage = volume.storages.sdcard;
                volumeStorage.removeEventListener('change', self);
              });
              this.documentStorageListener = false;
            }
          } else {
            if (!this.documentStorageListener) {
              this._volumeList.forEach(function(volume) {
                // use sdcard storage to represent this volume
                var volumeStorage = volume.storages.sdcard;
                volumeStorage.addEventListener('change', self);
              });
              this.documentStorageListener = true;
            }
            if (callback && Settings.currentPanel === '#mediaStorage')
              callback();
          }
        },

        updateInfo: function ms_updateInfo() {
          var self = this;
          this.umsVolumeShareState = false;
          this._volumeList.forEach(function(volume) {
            volume.updateInfo(function(state) {
              if (state === 'shared') {
                self.umsVolumeShareState = true;
              }
              self.updateMasterUmsDesc();
            });
          });
        }
      };
    };
});
