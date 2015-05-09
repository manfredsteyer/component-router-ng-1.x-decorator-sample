/* */
"use strict";
var _core = require("../core-js")["default"];
exports["default"] = function(obj, key, value) {
  return _core.Object.defineProperty(obj, key, {
    value: value,
    enumerable: key == null || typeof _core.Symbol == "undefined" || key.constructor !== _core.Symbol,
    configurable: true,
    writable: true
  });
};
exports.__esModule = true;
