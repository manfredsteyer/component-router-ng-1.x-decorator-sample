/* */ 
var $def = require("./$.def");
$def($def.S, 'Array', {of: function() {
    var index = 0,
        length = arguments.length,
        result = new (typeof this == 'function' ? this : Array)(length);
    while (length > index)
      result[index] = arguments[index++];
    result.length = length;
    return result;
  }});
