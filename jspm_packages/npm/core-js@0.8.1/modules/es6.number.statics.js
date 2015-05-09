/* */ 
var $ = require("./$"),
    $def = require("./$.def"),
    abs = Math.abs,
    floor = Math.floor,
    MAX_SAFE_INTEGER = 0x1fffffffffffff;
function isInteger(it) {
  return !$.isObject(it) && isFinite(it) && floor(it) === it;
}
$def($def.S, 'Number', {
  EPSILON: Math.pow(2, -52),
  isFinite: function(it) {
    return typeof it == 'number' && isFinite(it);
  },
  isInteger: isInteger,
  isNaN: function(number) {
    return number != number;
  },
  isSafeInteger: function(number) {
    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
  },
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
  parseFloat: parseFloat,
  parseInt: parseInt
});
