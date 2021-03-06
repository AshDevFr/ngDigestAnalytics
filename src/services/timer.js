function Timer(key, context) {
  this.key = key;
  this.context = context || {};
  this.init();
}

Timer.prototype.init = function () {
  this.watch = 0;
  this.handle = 0;
  this.overhead = 0;
  this.total = 0;
  this.cycleTotal = 0;
  this.cycleStart = null;
  this.cycleCount = 0;
  this.subTotal = 0;
};

Timer.prototype.startCycle = function(start) {
  this.cycleCount += 1;
  this.cycleStart = start;
  this.cycleTotal = 0;
  this.subTotal = 0;
  return this;
};

Timer.prototype.countTime = function(counter, duration) {
  this[counter] += duration - this.subTotal;
  this.cycleTotal += duration;
  this.subTotal = 0;
};

Timer.prototype.endCycle = function() {
  if (!this.cycleStart) {
    return;
  }
  const duration = Date.now() - this.cycleStart;
  this.overhead += duration - this.cycleTotal;
  this.cycleStart = null;
  this.sum();
  return duration;
};

Timer.prototype.sum = function() {
  this.total = this.watch + this.handle + this.overhead;
};

export default Timer;
