function Timer(key) {
  this.key = key
  this.init();
}

Timer.prototype.init = function () {
  this.watch = 0;
  this.handle = 0;
  this.overhead = 0;
  this.total = 0;
  this.cycleTotal = 0;
  this.cycleStart = null;
  this.subTotal = 0;
}





export default Timer;
