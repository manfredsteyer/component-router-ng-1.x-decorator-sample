/* */ 
var $def = require("./$.def");
$def($def.S, 'Object', {is: function(x, y) {
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  }});
