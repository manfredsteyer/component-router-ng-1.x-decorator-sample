/* */
"use strict";
var _core = require("../core-js")["default"];
exports["default"] = function set(object, property, value, receiver) {
  var desc = _core.Object.getOwnPropertyDescriptor(object, property);
  if (desc === undefined) {
    var parent = _core.Object.getPrototypeOf(object);
    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;
    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }
  return value;
};
exports.__esModule = true;
