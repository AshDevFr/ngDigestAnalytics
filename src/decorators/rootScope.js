import Timer from '../services/timer';
import logger from '../services/logger';
import monitor from '../services/monitor';

function $rootScope($delegate, digestAnalyticsConfig) {
  const proto = Object.getPrototypeOf($delegate),
      originalDigest = proto.$digest,
      originalEvalAsync = proto.$evalAsync,
      originalApplyAsync = proto.$applyAsync,
      originalPostDigest = proto.$$postDigest,
      originalWatch = proto.$watch,
      originalWatchGroup = proto.$watchGroup;

  proto.$digest = instrumentedDigest;
  proto.$evalAsync = instrumentedEvalAsync;
  proto.$applyAsync = instrumentedApplyAsync;
  proto.$$postDigest = instrumentedPostDigest;
  // proto.$watch = instrumentedWatch;
  // proto.$watchGroup = instrumentedWatchGroup;

  let watchTiming;

  function instrumentedDigest() {
    if (!digestAnalyticsConfig.isEnabled())
      return originalDigest.call(this);

    const start = Date.now();
    monitor.digestInProgress = true;
    try {
      originalDigest.call(this);
    } finally {
      monitor.digestInProgress = false;
    }
    const duration = Date.now() - start;
    logger.add({
      type: 'digest',
      value: duration
    });
  }

  function instrumentedEvalAsync(expression, locals) {
    var timing = monitor.createTiming('$evalAsync(' + monitor.formatExpression(expression) + ')');
    originalEvalAsync.call(
      this, wrapExpression(expression, timing, 'handle', true, true), locals);
  }

  function instrumentedApplyAsync(expression) {
    var timing = monitor.createTiming('$applyAsync(' + monitor.formatExpression(expression) + ')');
    originalApplyAsync.call(this, wrapExpression(expression, timing, 'handle', false, true));
  }

  function instrumentedPostDigest(fn) {
    if (timingStack.length) {
      fn = wrapExpression(fn, timingStack[timingStack.length - 1], 'overhead', true, true);
    }
    originalPostDigest.call(this, fn);
  }

  return $delegate;
}

$rootScope.$inject = ['$delegate', 'digestAnalyticsConfig'];

export default $rootScope;
