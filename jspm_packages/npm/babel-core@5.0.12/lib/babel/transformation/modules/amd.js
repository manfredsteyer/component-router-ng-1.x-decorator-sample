/* */
"format global";
"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var DefaultFormatter = _interopRequire(require("./_default"));

var CommonFormatter = _interopRequire(require("./common"));

var includes = _interopRequire(require("lodash/collection/includes"));

var values = _interopRequire(require("lodash/object/values"));

var util = _interopRequireWildcard(require("../../util"));

var t = _interopRequireWildcard(require("../../types"));

var AMDFormatter = (function (_DefaultFormatter) {
  function AMDFormatter() {
    _classCallCheck(this, AMDFormatter);

    if (_DefaultFormatter != null) {
      _DefaultFormatter.apply(this, arguments);
    }
  }

  _inherits(AMDFormatter, _DefaultFormatter);

  AMDFormatter.prototype.init = function init() {
    CommonFormatter.prototype._init.call(this, this.hasNonDefaultExports);
  };

  AMDFormatter.prototype.buildDependencyLiterals = function buildDependencyLiterals() {
    var names = [];
    for (var name in this.ids) {
      names.push(t.literal(name));
    }
    return names;
  };

  /**
   * Wrap the entire body in a `define` wrapper.
   */

  AMDFormatter.prototype.transform = function transform(program) {
    DefaultFormatter.prototype.transform.apply(this, arguments);

    var body = program.body;

    // build an array of module names

    var names = [t.literal("exports")];
    if (this.passModuleArg) names.push(t.literal("module"));
    names = names.concat(this.buildDependencyLiterals());
    names = t.arrayExpression(names);

    // build up define container

    var params = values(this.ids);
    if (this.passModuleArg) params.unshift(t.identifier("module"));
    params.unshift(t.identifier("exports"));

    var container = t.functionExpression(null, params, t.blockStatement(body));

    var defineArgs = [names, container];
    var moduleName = this.getModuleName();
    if (moduleName) defineArgs.unshift(t.literal(moduleName));

    var call = t.callExpression(t.identifier("define"), defineArgs);

    program.body = [t.expressionStatement(call)];
  };

  /**
   * Get the AMD module name that we'll prepend to the wrapper
   * to define this module
   */

  AMDFormatter.prototype.getModuleName = function getModuleName() {
    if (this.file.opts.moduleIds) {
      return DefaultFormatter.prototype.getModuleName.apply(this, arguments);
    } else {
      return null;
    }
  };

  AMDFormatter.prototype._getExternalReference = function _getExternalReference(node) {
    return this.scope.generateUidIdentifier(node.source.value);
  };

  AMDFormatter.prototype.importDeclaration = function importDeclaration(node) {
    this.getExternalReference(node);
  };

  AMDFormatter.prototype.importSpecifier = function importSpecifier(specifier, node, nodes) {
    var key = node.source.value;
    var ref = this.getExternalReference(node);

    if (t.isImportNamespaceSpecifier(specifier) || t.isImportDefaultSpecifier(specifier)) {
      this.defaultIds[key] = specifier.local;
    }

    if (includes(this.file.dynamicImportedNoDefault, node)) {
      // Prevent unnecessary renaming of dynamic imports.
      this.ids[node.source.value] = ref;
    } else if (t.isImportNamespaceSpecifier(specifier)) {} else if (!includes(this.file.dynamicImported, node) && t.isSpecifierDefault(specifier) && !this.noInteropRequireImport) {
      // import foo from "foo";
      var uid = this.scope.generateUidIdentifier(specifier.local.name);
      nodes.push(t.variableDeclaration("var", [t.variableDeclarator(uid, t.callExpression(this.file.addHelper("interop-require"), [ref]))]));
      ref = uid;
    } else {
      // import { foo } from "foo";
      var imported = specifier.imported;
      if (t.isSpecifierDefault(specifier)) imported = t.identifier("default");
      ref = t.memberExpression(ref, imported);
    }

    this.internalRemap[specifier.local.name] = ref;
  };

  AMDFormatter.prototype.exportSpecifier = function exportSpecifier(specifier, node, nodes) {
    if (this.doDefaultExportInterop(specifier)) {
      nodes.push(util.template("exports-default-assign", {
        VALUE: specifier.local
      }, true));
    } else {
      CommonFormatter.prototype.exportSpecifier.apply(this, arguments);
    }
  };

  AMDFormatter.prototype.exportDeclaration = function exportDeclaration(node, nodes) {
    if (this.doDefaultExportInterop(node)) {
      this.passModuleArg = true;

      var declar = node.declaration;
      var assign = util.template("exports-default-assign", {
        VALUE: this._pushStatement(declar, nodes)
      }, true);

      if (t.isFunctionDeclaration(declar)) {
        // we can hoist this assignment to the top of the file
        assign._blockHoist = 3;
      }

      nodes.push(assign);
      return;
    }

    DefaultFormatter.prototype.exportDeclaration.apply(this, arguments);
  };

  return AMDFormatter;
})(DefaultFormatter);

module.exports = AMDFormatter;

// import * as bar from "foo";
