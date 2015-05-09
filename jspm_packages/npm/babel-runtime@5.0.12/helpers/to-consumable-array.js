/* */
"use strict";
var _core = require("../core-js")["default"];
exports["default"] = function(arr) {
  if (_core.Array.isArray(arr)) {
    for (var i = 0,
        arr2 = Array(arr.length); i < arr.length; i++)
      arr2[i] = arr[i];
    return arr2;
  } else {
    return _core.Array.from(arr);
  }
};
exports.__esModule = true;
