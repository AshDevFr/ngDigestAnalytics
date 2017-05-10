import $parser from '../decorators/parser';
import $rootScope from '../decorators/rootScope';
import logger from '../services/logger';

function digestAnalyticsProvider($provide, digestAnalyticsConfig) {
  this.init = function (config) {
    digestAnalyticsConfig.init(config);
    logger.init();
    $provide.decorator('$parse', $parser);
    $provide.decorator('$rootScope', $rootScope);

    const originalBind = angular.bind;
    angular.bind = function(self, fn, args) {
      const result = originalBind.apply(this, arguments);
      result.exp = formatExpression(fn);
      return result;
    };
  };
  this.$get = function() {
    return {
      getData: function() {
        return logger.get();
      },
      analyse: function() {
        return logger.analyse();
      }
    };
  };
}

digestAnalyticsProvider.$inject = ['$provide', 'digestAnalyticsConfig'];

export default digestAnalyticsProvider;
