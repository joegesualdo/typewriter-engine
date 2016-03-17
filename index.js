var Promise = require('bluebird');

function TypeEffect(opts) {
  var opts = opts || {}
  this.content = "";
  this.onTick = function(){};
  this.onType = function(){};
  this.onDelete= function(){};
  this.onDone= function(){};
  this.currentInterval;
  this.speed = opts.speed || 1000
  // Functions that will be run when we call .run()
  this.fns = [];
}

TypeEffect.prototype.on = function(type, fn) {
  switch(type){
    case 'tick':
      this.onTick = fn;
      break;
    case 'type':
      this.onType = fn;
      break;
    case 'delete':
      this.onDelete = fn;
      break;
    case 'done':
      this.onDone = fn;
      break;
    default:
      break;
  }
  return this;
}

TypeEffect.prototype.type = function(chars) {
  var that = this;
  var fn = function(){
    return new Promise(function(resolve, reject){
      var i = 0;
      var typeInterval = setInterval(function(){
        that.content += chars[i]
        that.onTick(that.content)
        that.onType(chars[i], that.content)
        if (i === chars.length - 1) {
          clearInterval(typeInterval)
          resolve()
        } else {
          i++;
        }
      }, that.speed)
      that.currentInterval = typeInterval;
    });
  }
  this.fns.push(fn)
  return this;
}

TypeEffect.prototype.del = function(deleteCount) {
  var that = this;
  var fn = function(){
    return new Promise(function(resolve, reject){
      var i = 1;
      var deleteInterval = setInterval(function(){
        var charToDelete = that.content[that.content.length - 1]
        that.content = that.content.slice(0, that.content.length - 1)
        that.onTick(that.content)
        that.onDelete(charToDelete, that.content)
        if (i === deleteCount) {
          clearInterval(deleteInterval)
          resolve()
        } else {
          i++
        }
      }, that.speed)
      that.currentInterval = deleteInterval;
    })
  }
  this.fns.push(fn)
  return this;
}

TypeEffect.prototype.nextFn = function() {
  var that = this;
  if (this.fns.length === 0) {
    this.onDone(this.content);
    return
  } else {
    this.fns[0]().then(function(){
      that.fns.shift()
      that.nextFn();
    })
  }
}

TypeEffect.prototype.wait = function(ms) {
  var that = this;
  var fn = function(){
    return new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve()
      }, ms)
    })
  }
  this.fns.push(fn)
  return this;
}
TypeEffect.prototype.changeSpeed = function(speed) {
  var that = this;
  var fn = function(){
    return new Promise(function(resolve, reject){
      that.speed = speed;
      resolve();
    })
  }
  this.fns.push(fn)
  return this;
}

TypeEffect.prototype.stop = function() {
  clearInterval(this.currentInterval)
}

TypeEffect.prototype.run = function() {
  this.nextFn()
}

module.exports = TypeEffect;
