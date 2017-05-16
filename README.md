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

## Use data

```js
  angular
      .module('app')
      .service('dataUse', function (digestAnalytics, digestAnalyticsConfig) {
        this.enabled = digestAnalyticsConfig.isEnabled();

        this.toggleEnabled = () => {
          this.enabled = digestAnalyticsConfig.enable(!this.enabled);
        };

        this.doSomething = () => {
          const data = digestAnalytics.getData(),
              digestData = data.logs.digest;

          if (!digestData) // No data
            return;

          digestCount += digestData.count;

          // List of watchers
          const watches = data.watches.top;

          // Time since the launch
          const time = data.logs._time;

          // Total execution time since last reset
          const exectime = data.watches.totalTime;

          // Do a lot of stuff with your data
          /*
            ...
          */

          // Reset the data
          digestAnalytics.resetData();
        };
      });

```