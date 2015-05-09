/* */ 
var Infinity = 1 / 0,
    $def = require("./$.def"),
    E = Math.E,
    pow = Math.pow,
    abs = Math.abs,
    exp = Math.exp,
    log = Math.log,
    sqrt = Math.sqrt,
    ceil = Math.ceil,
    floor = Math.floor,
    sign = Math.sign || function(x) {
      return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
    };
function asinh(x) {
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
}
function expm1(x) {
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
}
$def($def.S, 'Math', {
  acosh: function(x) {
    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  },
  asinh: asinh,
  atanh: function(x) {
    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
  },
  cbrt: function(x) {
    return sign(x = +x) * pow(abs(x), 1 / 3);
  },
  clz32: function(x) {
    return (x >>>= 0) ? 32 - x.toString(2).length : 32;
  },
  cosh: function(x) {
    return (exp(x = +x) + exp(-x)) / 2;
  },
  expm1: expm1,
  fround: function(x) {
    return new Float32Array([x])[0];
  },
  hypot: function(value1, value2) {
    var sum = 0,
        len1 = arguments.length,
        len2 = len1,
        args = Array(len1),
        larg = -Infinity,
        arg;
    while (len1--) {
      arg = args[len1] = +arguments[len1];
      if (arg == Infinity || arg == -Infinity)
        return Infinity;
      if (arg > larg)
        larg = arg;
    }
    larg = arg || 1;
    while (len2--)
      sum += pow(args[len2] / larg, 2);
    return larg * sqrt(sum);
  },
  imul: function(x, y) {
    var UInt16 = 0xffff,
        xn = +x,
        yn = +y,
        xl = UInt16 & xn,
        yl = UInt16 & yn;
    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
  },
  log1p: function(x) {
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
  },
  log10: function(x) {
    return log(x) / Math.LN10;
  },
  log2: function(x) {
    return log(x) / Math.LN2;
  },
  sign: sign,
  sinh: function(x) {
    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
  },
  tanh: function(x) {
    var a = expm1(x = +x),
        b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  },
  trunc: function(it) {
    return (it > 0 ? floor : ceil)(it);
  }
});
