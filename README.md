## Type Effect 
> Typewriting simulation utility

## Install
```
$ npm install --save typeeffect
```

## Usage
```javascript
var TypeEffect = require("typeeffect");

console.log("")

var typeEffect = new TypeEffect({speed: 200})

typeEffect.on('delete', function(char, str) {
  console.log('\x1b[1A'+str+"|"+'\x1b[0K')
})
.on('type', function(char, str) {
  console.log('\x1b[1A\x1b[0K'+str+"|")
})
.on('done', function(str) {
  console.log("DONE")
})

typeEffect.type("Hello")
.del(5)
.type("Hi John")
.changeSpeed(100)
.del(4)
.type("Joe! My weekend was terrible")
.wait(2000)
.del(8)
.type("amazing!")
.run()
```
