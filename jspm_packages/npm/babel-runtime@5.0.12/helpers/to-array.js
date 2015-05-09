/* */
"use strict";
var _core = require("../core-js")["default"];
exports["default"] = function(arr) {
  return _core.Array.isArray(arr) ? arr : _core.Array.from(arr);
};
exports.__esModule = true;
