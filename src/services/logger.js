function Logger() {
  if (!Logger.instance) {
    this._initialTime = 0;
    this.logs = [];
    Logger.instance = this;
  }

  return Logger.instance;
}

Logger.prototype.init = function() {
  this._initialTime = Date.now();
};

Logger.prototype.add = function(data) {
  this.logs.push(data);
};

Logger.prototype.get = function() {
  return this.logs;
};

Logger.prototype.reset = function() {
  this.logs = [];
};

Logger.prototype.analyse = function() {
  const runningFor = Date.now() - this._initialTime;
  let result = {},
    total = {},
    count = {};
  this.logs.forEach(d => {
    if (!result[d.type]) {
      result[d.type] = {};
    }
    result[d.type].count = (result[d.type].count || 0) + 1;
    result[d.type].min = typeof result[d.type].min === 'undefined' ? d.value : Math.min(result[d.type].min, d.value);
    result[d.type].max = typeof result[d.type].max === 'undefined' ? d.value : Math.max(result[d.type].max, d.value);
    total[d.type] = (total[d.type] || 0) + d.value;
  });

  Object.keys(result).forEach(k => {
    result[k].avg = total[k] / result[k].count;
  });

  result._time = runningFor;
  return result;
};

const instance = new Logger();

export default instance;
