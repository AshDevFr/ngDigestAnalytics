import $parser from './decorators/parser';
import $rootScope from './decorators/rootScope';
import logger from './services/logger';

function digestAnalyticProvider($provide) {
  this.init = function () {
    $provide.decorator('$parse', $parser);
    $provide.decorator('$rootScope', $rootScope);
  };
  this.$get = function() {
    return {
      getData: function() {
        return logger.get();
      }
    };
  };
}

digestAnalyticProvider.$inject = ['$provide'];

export default digestAnalyticProvider;
