/* */
"use strict";
var _core = require("../core-js")["default"];
exports["default"] = function get(_x, _x2, _x3) {
  var _again = true;
  _function: while (_again) {
    desc = parent = getter = undefined;
    _again = false;
    var object = _x,
        property = _x2,
        receiver = _x3;
    var desc = _core.Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
      var parent = _core.Object.getPrototypeOf(object);
      if (parent === null) {
        return undefined;
      } else {
        _x = parent;
        _x2 = property;
        _x3 = receiver;
        _again = true;
        continue _function;
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;
      if (getter === undefined) {
        return undefined;
      }
      return getter.call(receiver);
    }
  }
};
exports.__esModule = true;
