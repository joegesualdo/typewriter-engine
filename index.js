var Promise = require('bluebird');

function TypeEffect(opts) {
  var opts = opts || {}
  this.content = "";
  this.onTick = function(){};
  this.onType = function(){};
  this.onDelete= function(){};
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
    default:
      break;
  }
  return this;
}

TypeEffect.prototype.type = function(chars) {
  var that = this;
  var fn = function(){
    return new Promise(function(resolve, reject){
      for(var i = 0; i < chars.length; i++) {
        setTimeout(function(i){
          that.content += chars[i]
          that.onTick(that.content)
          that.onType(chars[i], that.content)
          if (i === chars.length - 1) {
            // Wrapping this in a timeout so we have time when switching to another mode (I.e. del) 
            setTimeout(function(){
              resolve()
            }, that.speed)
          }
        }.bind(null, i), i * that.speed)
      }
    });
  }
  this.fns.push(fn)
  return this;
}

TypeEffect.prototype.del = function(deleteCount) {
  var that = this;
  var fn = function(){
    return new Promise(function(resolve, reject){
      for(var i = 0; i < deleteCount; i++) {
          setTimeout(function(i){
            var charToDelete = that.content[that.content.length - 1]
            that.content = that.content.slice(0, that.content.length - 1)
            that.onTick(that.content)
            that.onDelete(charToDelete, that.content)
            if (i === deleteCount - 1) {
              // Wrapping this in a timeout so we have time when switching to another mode (I.e. del) 
              setTimeout(function(){
                resolve()
              }, that.speed)
            }
          }.bind(null, i), i * that.speed)
      }
    })
  }
  this.fns.push(fn)
  return this;
}

TypeEffect.prototype.nextFn = function() {
  var that = this;
  if (this.fns.length === 0) {
    return
  } else {
    this.fns[0]().then(function(){
      that.fns.shift()
      that.nextFn();
    })
  }
}

TypeEffect.prototype.run= function() {
  this.nextFn()
}



TypeEffect.prototype.wait = function(ms) {
}

console.log("")
var typeEffect = new TypeEffect({speed: 200})

typeEffect.on('delete', function(char, str) {
  console.log('\x1b[1A'+str+"|"+'\x1b[0K')
})
.on('type', function(char, str) {
  console.log('\x1b[1A\x1b[0K'+str+"|")
})
.type("Hello")
.del(5)
.type("Hi John")
.del(4)
.type("Joe! My weekend was terrible")
.del(8)
.type("amazing!")
.run()
