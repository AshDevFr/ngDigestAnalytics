import logger from '../services/logger';
import monitor from '../services/monitor';

function $rootScope($delegate, digestAnalyticsConfig) {
  const originalDigest = $delegate.$digest,
      originalEvalAsync = $delegate.$evalAsync,
      originalApplyAsync = $delegate.$applyAsync,
      originalPostDigest = $delegate.$$postDigest,
      originalWatch = $delegate.$watch,
      originalWatchGroup = $delegate.$watchGroup;

  $delegate.$digest = instrumentedDigest;
  $delegate.$evalAsync = instrumentedEvalAsync;
  $delegate.$applyAsync = instrumentedApplyAsync;
  $delegate.$$postDigest = instrumentedPostDigest;
  $delegate.$watch = instrumentedWatch;
  $delegate.$watchGroup = instrumentedWatchGroup;

  let watchTiming;

  function instrumentedDigest() {
    if (!digestAnalyticsConfig.isEnabled())
      return originalDigest.call(this);

    monitor.initStack();
    this.$$postDigest(monitor.flushTimingCycle.bind(monitor));
    const start = Date.now();
    monitor.digestInProgress = true;
    try {
      originalDigest.call(this);
    } finally {
      monitor.digestInProgress = false;
    }
    const duration = Date.now() - start;
    monitor.overheadTiming.overhead += duration;
    logger.add({
      type: 'digest',
      value: duration
    });
  }

  function instrumentedEvalAsync(expression, locals) {
    if (!digestAnalyticsConfig.isEnabled())
      return originalEvalAsync.call(this, expression, locals);

    const timing = monitor.createTiming('$evalAsync(' + monitor.formatExpression(expression) + ')', this.$$da_context);
    originalEvalAsync.call(
      this, monitor.wrapExpression(expression, timing, 'handle', true, true), locals);
  }

  function instrumentedApplyAsync(expression) {
    if (!digestAnalyticsConfig.isEnabled())
      return originalApplyAsync.call(this, expression);

    var timing = monitor.createTiming('$applyAsync(' + monitor.formatExpression(expression) + ')', this.$$da_context);
    originalApplyAsync.call(this, monitor.wrapExpression(expression, timing, 'handle', false, true));
  }

  function instrumentedPostDigest(expression) {
    if (!digestAnalyticsConfig.isEnabled())
      return originalPostDigest.call(this, expression);

    const timing = monitor.createTiming('$$postDigest(' + monitor.formatExpression(expression) + ')', this.$$da_context);
    originalPostDigest.call(this, monitor.wrapExpression(expression, timing, 'handle', true, true));
  }

  function instrumentedWatch(watchExpression, listener, objectEquality) {
    if (!digestAnalyticsConfig.isEnabled())
      return originalWatch.call(this, watchExpression, listener, objectEquality);

    // jshint validthis:true
    let watchTimingSet = false;
    if (!watchTiming) {
      // Capture watch timing (and its key) once, before we descend in $$watchDelegates.
      watchTiming = monitor.createTiming(monitor.formatExpression(watchExpression), this.$$da_context);
      watchTimingSet = true;
    }
    try {
      if (angular.isString(watchExpression)) {
        try {
          const parsedWatchExpression = monitor.getParse()(watchExpression);
          watchExpression = parsedWatchExpression;
        } catch(e) {}
      }
      if (watchExpression && watchExpression.$$watchDelegate) {
        return originalWatch.call(this, watchExpression, listener, objectEquality);
      } else {
        return originalWatch.call(
          this, monitor.wrapExpression(watchExpression, watchTiming, 'watch', true, false),
          monitor.wrapListener(listener, watchTiming), objectEquality);
      }
    } finally {
      if (watchTimingSet) watchTiming = null;
    }
  }

  function instrumentedWatchGroup(watchExpressions, listener) {
    if (!digestAnalyticsConfig.isEnabled())
      return originalWatchGroup.call(this, watchExpressions, listener);

    // jshint validthis:true
    let watchTimingSet = false;
    if (!watchTiming) {
      // $watchGroup delegates to $watch for each expression, so just make sure to set the group's
      // aggregate key as the override first.
      watchTiming = monitor.createTiming(
        '[' + watchExpressions.map(e => monitor.formatExpression(e)).join(', ') + ']', this.$$da_context);
      watchTimingSet = true;
    }
    try {
      return originalWatchGroup.call(this, watchExpressions, listener);
    } finally {
      if (watchTimingSet) watchTiming = null;
    }
  }

  return $delegate;
}

$rootScope.$inject = ['$delegate', 'digestAnalyticsConfig'];

export default $rootScope;
