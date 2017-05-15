import Timer from './timer';
import digestAnalyticsConfig from '../components/digestAnalyticsConfig.constant';

let $parse,
  timingStack = [];

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

Monitor.prototype.reset = function () {
  this.initStack();
  this.watchTimings = {};
  this.overheadTiming.init();
};

Monitor.prototype.getParse = function () {
  if (!$parse) {
    const modules = [
      'ng',
      ...digestAnalyticsConfig.additionalDependencies()
    ];
    $parse = angular.injector(modules).get('$parse');
  }
  return $parse;
};

Monitor.prototype.initStack = function () {
  timingStack = [];
};

Monitor.prototype.hasStack = function () {
  return timingStack.length;
};

Monitor.prototype.addTimer = function (timer) {
  timingStack.push(timer);
};

Monitor.prototype.removeTimer = function (timer) {
  timingStack = timingStack.filter(t => t !== timer);
};

Monitor.prototype.lastTimer = function () {
  if (timingStack.length)
    return timingStack[timingStack.length - 1];

  return null;
};

Monitor.prototype.wrapListener = function(listener, timing) {
  if (!listener)
    return listener;

  return function instrumentedListener() {
    const start = Date.now();
    try {
      return listener.apply(this, arguments);
    } finally {
      timing.countTime('handle', Date.now() - start);
    }
  };
};

Monitor.prototype.createTiming = function(key, context) {
  let timing = this.watchTimings[key];
  if (!timing)
    timing = this.watchTimings[key] = new Timer(key, context);

  return timing;
};

Monitor.prototype.formatExpression = function(watchExpression) {
  if (!watchExpression) return '';
  if (typeof watchExpression === 'string') return watchExpression;
  if (typeof watchExpression.exp === 'string') return watchExpression.exp;
  if (watchExpression.name) return `function ${watchExpression.name}() {\u2026}`;
  return watchExpression.toString();
};

Monitor.prototype.wrapExpression = function(expression, timing, counter, flushCycle, endCycle) {
  const self = this;
  if (!expression && !flushCycle) return expression;
  let actualExpression;
  if (typeof expression === 'string')
    try {
      actualExpression = this.getParse()(expression);
    } catch(e) {
      digestAnalyticsConfig.debugEnabled() && console.warn('Unable to parse :', expression);
      return expression;
    }
  else
    actualExpression = expression;

  return function instrumentedExpression() {
    if (flushCycle) self.flushTimingCycle();
    if (!actualExpression) return;
    if (!self.digestInProgress) return actualExpression.apply(this, arguments);
    const start = Date.now();
    timing.startCycle(start);
    self.addTimer(timing);
    try {
      return actualExpression.apply(this, arguments);
    } finally {
      timing.countTime(counter, Date.now() - start);
      if (endCycle) {
        const duration = timing.endCycle();
        if (duration) {
          self.removeTimer(timing);
          if (self.hasStack())
            self.lastTimer().subTotal += duration;
          else
            self.overheadTiming.overhead -= duration;
        }
      }
    }
  };
};

Monitor.prototype.flushTimingCycle = function() {
  if (this.hasStack()) {
    const timer = this.lastTimer();
    const duration = timer.endCycle();
    this.removeTimer(timer);
    if (!duration)
      return;

    if (this.hasStack())
      this.lastTimer().subTotal += duration;
    else
      this.overheadTiming.overhead -= duration;
  }
};

Monitor.prototype.serializeData = function () {
  let totalTime = 0;
  const top = Object.keys(this.watchTimings)
    .map(k => {
      totalTime += this.watchTimings[k].total;
      return this.watchTimings[k]
    })
    .filter(t => t.total)
    .sort((t1, t2) => {
      if (t1.total === t2.total)
        return 0;
      return t1.total < t2.total ? 1 : -1
    })
    .slice(0, digestAnalyticsConfig.numTopWatches());

  return {
    top,
    totalTime
  };
};

Monitor.prototype.logData = function () {
  const {top, totalTime} = this.serializeData();

  console.log(`Total execution time: ${timeToStr(totalTime)}`);

  top.forEach(t => {
    const context = t.context.replace(/\s+/g, ' ').slice(0, 50);
    const title = (context ? `${context} ` : '') + t.key.replace(/\s+/g, ' ').slice(0, 100);
    const percentage = ((t.total / totalTime) * 100).toFixed(2);
    console.log(`${percentage}% (${timeToStr(t.total)}) : ${title}`);
  });

  function timeToStr(t) {
    return t > 1000 ? `${(t / 1000).toFixed(2)} s` : `${t} ms`
  }
};

const instance = new Monitor();

export default instance;
