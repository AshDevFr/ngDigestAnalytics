import angular from 'angular';
import digestAnalyticProvider from './digestAnalytic.provider';

module.exports = angular.module('ng-digest-analytic', [])
 .provider('digestAnalytic', digestAnalyticProvider);
