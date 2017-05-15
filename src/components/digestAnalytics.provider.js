import $controller from '../decorators/controller';
import $parse from '../decorators/parse';
import $q from '../decorators/q';
import $rootScope from '../decorators/rootScope';
import logger from '../services/logger';
import monitor from '../services/monitor';

function digestAnalyticsProvider($provide, digestAnalyticsConfig) {
  this.init = function (config) {
    digestAnalyticsConfig.init(config);
    logger.init();
    $provide.decorator('$controller', $controller);
    $provide.decorator('$parse', $parse);
    $provide.decorator('$q', $q);
    $provide.decorator('$rootScope', $rootScope);

    const originalBind = angular.bind;
    angular.bind = function(self, fn, args) {
      const result = originalBind.apply(this, arguments);
      result.exp = monitor.formatExpression(fn);
      return result;
    };
  };
  this.$get = function() {
    return {
      getData: function() {
        return {
          logs: logger.analyse(),
          watches: monitor.serializeData()
        }
      },
      resetData: function () {
        logger.reset();
        monitor.reset();
      },
      getLogger: function() {
        return logger;
      },
      getMonitor: function () {
        return monitor;
      }
    };
  };
}

digestAnalyticsProvider.$inject = ['$provide', 'digestAnalyticsConfig'];

export default digestAnalyticsProvider;
