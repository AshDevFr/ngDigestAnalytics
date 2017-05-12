# ngDigestAnalytics

## Install

```sh
$ npm install --save ng-digest-analytics
```

## Add to your project

```js
angular
    .module('app', ['ng-digest-analytics'])
    .config(function(digestAnalyticsProvider) {
      digestAnalyticsProvider.init({
        enabled: true, // Default: true
        watchPromises: true, // Default: true
        debug: true, // Default: false
        additionalDependencies: ['specific-lib'], // Default: []
        numTopWatches: 25 // Default: 10
      });
    });
```