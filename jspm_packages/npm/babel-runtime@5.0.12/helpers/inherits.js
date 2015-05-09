/* */
"use strict";
var _core = require("../core-js")["default"];
exports["default"] = function(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = _core.Object.create(superClass && superClass.prototype, {constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }});
  if (superClass)
    subClass.__proto__ = superClass;
};
exports.__esModule = true;
