function $q($delegate, digestAnalyticsConfig) {
  const proto = Object.getPrototypeOf($delegate.defer().promise),
      originalThen = proto.then,
      originalFinally = proto.finally;
  proto.then = instrumentedThen;
  proto.finally = instrumentedFinally;

  function instrumentedThen(onFulfilled, onRejected, progressBack) {
    if (!digestAnalyticsConfig.isEnabled())
      return originalThen.call(this, onFulfilled, onRejected, progressBack);

    return originalThen.call(
      this,
      wrapExpression(
        onFulfilled, createTiming('$q(' + formatExpression(onFulfilled) + ')'), 'handle',
        false, true),
      wrapExpression(
        onRejected, createTiming('$q(' + formatExpression(onRejected) + ')'), 'handle',
        false, true),
      wrapExpression(
        progressBack, createTiming('$q(' + formatExpression(progressBack) + ')'), 'handle',
        false, true)
    );
  }

  function instrumentedFinally(callback, progressBack) {
    if (!digestAnalyticsConfig.isEnabled())
      return originalThen.call(this, callback, progressBack);

    return originalFinally.call(
      this,
      wrapExpression(
        callback, createTiming('$q(' + formatExpression(callback) + ')'), 'handle',
        false, true),
      wrapExpression(
        progressBack, createTiming('$q(' + formatExpression(callback) + ')'), 'handle',
        false, true)
    );
  }

  return $delegate;
}

$q.$inject = ['$delegate', 'digestAnalyticsConfig'];

export default $q;
