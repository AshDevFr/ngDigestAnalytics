import monitor from '../services/monitor';

function $q($delegate, digestAnalyticsConfig) {
  const proto = Object.getPrototypeOf($delegate.defer().promise),
      originalThen = proto.then,
      originalFinally = proto.finally;
  proto.then = instrumentedThen;
  proto.finally = instrumentedFinally;

  function instrumentedThen(onFulfilled, onRejected, progressBack) {
    if (!digestAnalyticsConfig.isEnabled() || !digestAnalyticsConfig.watchPromises())
      return originalThen.call(this, onFulfilled, onRejected, progressBack);

    return originalThen.call(
      this,
      monitor.wrapExpression(
        onFulfilled, monitor.createTiming('$q(' + monitor.formatExpression(onFulfilled) + ')'), 'handle',
        false, true),
      monitor.wrapExpression(
        onRejected, monitor.createTiming('$q(' + monitor.formatExpression(onRejected) + ')'), 'handle',
        false, true),
      monitor.wrapExpression(
        progressBack, monitor.createTiming('$q(' + monitor.formatExpression(progressBack) + ')'), 'handle',
        false, true)
    );
  }

  function instrumentedFinally(callback, progressBack) {
    if (!digestAnalyticsConfig.isEnabled() || !digestAnalyticsConfig.watchPromises())
      return originalFinally.call(this, callback, progressBack);

    return originalFinally.call(
      this,
      monitor.wrapExpression(
        callback, monitor.createTiming('$q(' + monitor.formatExpression(callback) + ')'), 'handle',
        false, true),
      monitor.wrapExpression(
        progressBack, monitor.createTiming('$q(' + monitor.formatExpression(callback) + ')'), 'handle',
        false, true)
    );
  }

  return $delegate;
}

$q.$inject = ['$delegate', 'digestAnalyticsConfig'];

export default $q;
