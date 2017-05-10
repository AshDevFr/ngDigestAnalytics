import Timer from './timer';

let $parse;

function Monitor() {
  if (!Monitor.instance) {
    this.digestTimings = [];
    this.watchTimings = {};
    this.overheadTiming = this.createTiming('$$ng-overhead');
    this.digestInProgress = false;

    Monitor.instance = this;
  }

  return Monitor.instance;
}

Monitor.prototype.wrapListener = function(listener, timing) {
  if (!listener) {
    return listener;
  }
  return function instrumentedListener() {
    const start = Date.now();
    try {
      return listener.apply(this, arguments);
    } finally {
      timing.countTime('handle', Date.now() - start);
    }
  };
};

Monitor.prototype.createTiming = function(key) {
  let timing = this.watchTimings[key];
  if (!timing) {
    timing = this.watchTimings[key] = new Timer(key);
  }
  return timing;
};

Monitor.prototype.formatExpression = function(watchExpression) {
  if (!watchExpression) return '';
  if (typeof watchExpression === 'string') return watchExpression;
  if (typeof watchExpression.exp === 'string') return watchExpression.exp;
  if (watchExpression.name) return 'function ' + watchExpression.name + '() {\u2026}';
  return watchExpression.toString();
};

Monitor.prototype.formatExpression = function(expression, timing, counter, flushCycle, endCycle) {
  self = this;
  if (!expression && !flushCycle) return expression;
  if (!$parse) angular.injector(['ng']).invoke(['$parse', function(parse) {
    $parse = parse;
  }]);
  const actualExpression = typeof expression === 'string' ? $parse(expression) : expression;
  return function instrumentedExpression() {
    if (flushCycle) flushTimingCycle();
    if (!actualExpression) return;
    if (!self.digestInProgress) return actualExpression.apply(this, arguments);
    const start = Date.now();
    timing.startCycle(start);
    try {
      return actualExpression.apply(this, arguments);
    } finally {
      timing.countTime(counter, Date.now() - start);
      if (endCycle) timing.endCycle();
    }
  };
};

const instance = new Monitor();

export default instance;
