const defaultConfig = {
  enabled: true,
  watchPromises: true,
  debug: false,
  additionalDependencies: [],
  numTopWatches: 10
};

let _config;

const digestAnalyticsConfig = {
  init: function (config) {
    _config = Object.assign({}, defaultConfig, config);
  },
  enable: function (enabled) {
    _config.enabled = enabled;
    console.log('digestAnalytics', _config.enabled);
    return _config.enabled;
  },
  isEnabled: () => Boolean(_config.enabled),
  debugEnabled: () => Boolean(_config.debug),
  additionalDependencies: () => _config.additionalDependencies ? Array.from(_config.additionalDependencies) : [],
  numTopWatches: () => _config.numTopWatches,
  watchPromises: () => _config.watchPromises
};

export default (function digestAnalyticsConfigConstant() {
  return digestAnalyticsConfig;
})();
