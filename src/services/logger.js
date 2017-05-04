function Logger () {
  if(!Logger.instance) {
    this.logs = [];
    Logger.instance = this;
  }

  return Logger.instance;
}

Logger.prototype.add = function (data) {
  this.logs.push(data);
};

Logger.prototype.get = function () {
  return this.logs;
};

Logger.prototype.reset = function () {
  this.logs = [];
};

const instance = new Logger();
Object.freeze(instance);

export default instance;
