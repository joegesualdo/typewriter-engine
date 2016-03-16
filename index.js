var Promise = require('bluebird');

function TypeEffect(opts) {
  var opts = opts || {}
  this.content = ""
  this.onTick = function(){};
  this.onType = function(){};
  this.onDelete= function(){};
  this.speed = opts.speed || 1000
  // Function that need to be run when we call .run()
  this.fns = []
}

TypeEffect.prototype.on = function(type, fn) {
  if (type === 'tick') {
    this.onTick = fn
  }
  if (type === 'type') {
    this.onType = fn
  }
  if (type === 'delete') {
    this.onDelete = fn
  }
  return this;
}

TypeEffect.prototype.type = function(chars) {
  var that = this;
  var fn = function(){
    return new Promise(function(resolve, reject){
      for(var i = 0; i < chars.length; i++) {
        (function(i, typeEffectInstance){
          setTimeout(function(){
            typeEffectInstance.content += chars[i]
            typeEffectInstance.onTick(typeEffectInstance.content)
            typeEffectInstance.onType(chars[i], typeEffectInstance.content)
            if (i === chars.length - 1) {
              // Wrapping this in a timeout so we have time when switching to another mode (I.e. del) 
              setTimeout(function(){
                resolve()
              }, typeEffectInstance.speed)
            }
          }, i * typeEffectInstance.speed)
        })(i, that)
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
        (function(i, typeEffectInstance){
          setTimeout(function(){
            var characterToDelete = typeEffectInstance.content[typeEffectInstance.content.length - 1]
            typeEffectInstance.content = typeEffectInstance.content.slice(0, typeEffectInstance.content.length - 1)
            typeEffectInstance.onTick(typeEffectInstance.content)
            typeEffectInstance.onDelete(characterToDelete, typeEffectInstance.content)
            if (i === deleteCount - 1) {
              // Wrapping this in a timeout so we have time when switching to another mode (I.e. del) 
              setTimeout(function(){
                resolve()
              }, typeEffectInstance.speed)
            }
          }, i * typeEffectInstance.speed)
        })(i,typeEffect);
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
