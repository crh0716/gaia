'use strict';

(function() {
  var mobileConnections = navigator.mozMobileConnections;
  if (!mobileConnections) {
    return;
  }

  var voicePrivacyHelper = VoicePrivacySettingsHelper();
  var initVoicePrivacy = function vp(conn, index) {
    if (conn.setVoicePrivacyMode) {
      voicePrivacyHelper.getEnabled(index, function gotEnabled(enabled) {
        var setReq = conn.setVoicePrivacyMode(enabled);
        setReq.onerror = function set_vpm_error() {
          console.error('Error setting voice privacy.');
        };
      });
    }
  };

  Array.prototype.forEach.call(mobileConnections, initVoicePrivacy);
})();
