const defaultConfig = {
  enabled: true
};

export default (function digestAnalyticsConfig() {
  let _config;

  return {
    init: function (config) {
      _config = Object.assign({}, defaultConfig, config);
    },
    enable: function (enabled) {
      _config.enabled = enabled;
      console.log('digestAnalytics', _config.enabled);
      return _config.enabled;
    },
    isEnabled: function () {
      return Boolean(_config.enabled);
    }
  }
})();
