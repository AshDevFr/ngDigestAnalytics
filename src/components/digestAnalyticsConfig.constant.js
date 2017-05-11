const defaultConfig = {
  enabled: true,
  debug: false,
  additionalDependencies: []
};

const digestAnalyticsConfig = {
  init: function (config) {
    this._config = Object.assign({}, defaultConfig, config);
  },
  enable: function (enabled) {
    this._config.enabled = enabled;
    console.log('digestAnalytics', _config.enabled);
    return this._config.enabled;
  },
  isEnabled: function () {
    return Boolean(this._config.enabled);
  },
  debugEnabled: function () {
    return Boolean(this._config.debug);
  },
  getAdditionalDependencies: function () {
    return this._config.additionalDependencies ? Array.from(this._config.additionalDependencies) : [];
  }
};

export default (function digestAnalyticsConfigConstant() {
  return digestAnalyticsConfig;
})();
