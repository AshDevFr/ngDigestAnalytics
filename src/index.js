import digestAnalyticsProvider from './components/digestAnalytics.provider';
import digestAnalyticsConfig from './components/digestAnalyticsConfig.constant';

module.exports = angular.module('ng-digest-analytics', [])
 .provider('digestAnalytics', digestAnalyticsProvider)
 .constant('digestAnalyticsConfig', digestAnalyticsConfig);
