/* */
"format global";
"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var convertSourceMap = _interopRequire(require("convert-source-map"));

var optionParsers = _interopRequireWildcard(require("./option-parsers"));

var shebangRegex = _interopRequire(require("shebang-regex"));

var TraversalPath = _interopRequire(require("../../traversal/path"));

var isFunction = _interopRequire(require("lodash/lang/isFunction"));

var isAbsolute = _interopRequire(require("path-is-absolute"));

var resolveRc = _interopRequire(require("../../tools/resolve-rc"));

var sourceMap = _interopRequire(require("source-map"));

var transform = _interopRequire(require("./../index"));

var generate = _interopRequire(require("../../generation"));

var defaults = _interopRequire(require("lodash/object/defaults"));

var includes = _interopRequire(require("lodash/collection/includes"));

var traverse = _interopRequire(require("../../traversal"));

var assign = _interopRequire(require("lodash/object/assign"));

var Logger = _interopRequire(require("./logger"));

var parse = _interopRequire(require("../../helpers/parse"));

var Scope = _interopRequire(require("../../traversal/scope"));

var slash = _interopRequire(require("slash"));

var util = _interopRequireWildcard(require("../../util"));

var path = _interopRequire(require("path"));

var each = _interopRequire(require("lodash/collection/each"));

var t = _interopRequireWildcard(require("../../types"));

var checkTransformerVisitor = {
  enter: function enter(node, parent, scope, state) {
    checkNode(state.stack, node, scope);
  }
};

function checkNode(stack, node, scope) {
  each(stack, function (pass) {
    if (pass.shouldRun || pass.ran) return;
    pass.checkNode(node, scope);
  });
}

var File = (function () {
  function File() {
    var opts = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, File);

    this.dynamicImportedNoDefault = [];
    this.dynamicImportIds = {};
    this.dynamicImported = [];
    this.dynamicImports = [];

    this.usedHelpers = {};
    this.dynamicData = {};
    this.data = {};
    this.uids = {};

    this.lastStatements = [];
    this.log = new Logger(this, opts.filename || "unknown");
    this.opts = this.normalizeOptions(opts);
    this.ast = {};

    this.buildTransformers();
  }

  File.helpers = ["inherits", "defaults", "create-class", "create-decorated-class", "tagged-template-literal", "tagged-template-literal-loose", "interop-require", "to-array", "to-consumable-array", "sliced-to-array", "sliced-to-array-loose", "object-without-properties", "has-own", "slice", "bind", "define-property", "async-to-generator", "interop-require-wildcard", "typeof", "extends", "get", "set", "class-call-check", "object-destructuring-empty", "temporal-undefined", "temporal-assert-defined", "self-global", "default-props"];
  File.options = require("./options");

  File.prototype.normalizeOptions = function normalizeOptions(opts) {
    opts = assign({}, opts);

    if (opts.filename) {
      var rcFilename = opts.filename;
      if (!isAbsolute(rcFilename)) rcFilename = path.join(process.cwd(), rcFilename);
      opts = resolveRc(rcFilename, opts);
    }

    //

    for (var key in opts) {
      if (key[0] === "_") continue;

      var option = File.options[key];
      if (!option) this.log.error("Unknown option: " + key, ReferenceError);
    }

    for (var key in File.options) {
      var option = File.options[key];

      var val = opts[key];
      if (!val && option.optional) continue;

      if (val && option.deprecated) {
        throw new Error("Deprecated option " + key + ": " + option.deprecated);
      }

      if (val == null) val = option["default"] || val;

      var optionParser = optionParsers[option.type];
      if (optionParser) val = optionParser(key, val);

      if (option.alias) {
        var _opts = opts;
        var _option$alias = option.alias;
        if (!_opts[_option$alias]) _opts[_option$alias] = val;
      } else {
        opts[key] = val;
      }
    }

    if (opts.inputSourceMap) {
      opts.sourceMaps = true;
    }

    // normalize windows path separators to unix
    opts.filename = slash(opts.filename);
    if (opts.sourceRoot) {
      opts.sourceRoot = slash(opts.sourceRoot);
    }

    if (opts.moduleId) {
      opts.moduleIds = true;
    }

    opts.basename = path.basename(opts.filename, path.extname(opts.filename));

    opts.ignore = util.arrayify(opts.ignore, util.regexify);
    opts.only = util.arrayify(opts.only, util.regexify);

    defaults(opts, {
      moduleRoot: opts.sourceRoot
    });

    defaults(opts, {
      sourceRoot: opts.moduleRoot
    });

    defaults(opts, {
      filenameRelative: opts.filename
    });

    defaults(opts, {
      sourceFileName: opts.filenameRelative,
      sourceMapName: opts.filenameRelative
    });

    //

    if (opts.externalHelpers) {
      this.set("helpersNamespace", t.identifier("babelHelpers"));
    }

    return opts;
  };

  File.prototype.isLoose = function isLoose(key) {
    return includes(this.opts.loose, key);
  };

  File.prototype.buildTransformers = function buildTransformers() {
    var file = this;

    var transformers = this.transformers = {};

    var secondaryStack = [];
    var stack = [];

    // build internal transformers
    each(transform.transformers, function (transformer, key) {
      var pass = transformers[key] = transformer.buildPass(file);

      if (pass.canTransform()) {
        stack.push(pass);

        if (transformer.metadata.secondPass) {
          secondaryStack.push(pass);
        }

        if (transformer.manipulateOptions) {
          transformer.manipulateOptions(file.opts, file);
        }
      }
    });

    // init plugins!
    var beforePlugins = [];
    var afterPlugins = [];
    for (var i = 0; i < file.opts.plugins.length; i++) {
      this.addPlugin(file.opts.plugins[i], beforePlugins, afterPlugins);
    }
    stack = beforePlugins.concat(stack, afterPlugins);

    // register
    this.transformerStack = stack.concat(secondaryStack);
  };

  File.prototype.getModuleFormatter = function getModuleFormatter(type) {
    var ModuleFormatter = isFunction(type) ? type : transform.moduleFormatters[type];

    if (!ModuleFormatter) {
      var loc = util.resolveRelative(type);
      if (loc) ModuleFormatter = require(loc);
    }

    if (!ModuleFormatter) {
      throw new ReferenceError("Unknown module formatter type " + JSON.stringify(type));
    }

    return new ModuleFormatter(this);
  };

  File.prototype.addPlugin = function addPlugin(name, before, after) {
    var position = "before";
    var plugin;

    if (name) {
      if (typeof name === "string") {
        // this is a plugin in the form of "foobar" or "foobar:after"
        // where the optional colon is the delimiter for plugin position in the transformer stack

        var _ref = name.split(":");

        var _ref2 = _slicedToArray(_ref, 2);

        name = _ref2[0];
        var _ref2$1 = _ref2[1];
        position = _ref2$1 === undefined ? "before" : _ref2$1;

        var loc = util.resolveRelative(name) || util.resolveRelative("babel-plugin-" + name);
        if (loc) {
          plugin = require(loc);
        } else {
          throw new ReferenceError("Unknown plugin " + JSON.stringify(name));
        }
      } else {
        // not a string so we'll just assume that it's a direct Transformer instance, if not then
        // the checks later on will complain
        plugin = name;
      }
    } else {
      throw new TypeError("Ilegal kind " + typeof name + " for plugin name " + JSON.stringify(name));
    }

    // validate position
    if (position !== "before" && position !== "after") {
      throw new TypeError("Plugin " + JSON.stringify(name) + " has an illegal position of " + JSON.stringify(position));
    }

    // validate transformer key
    var key = plugin.key;
    if (this.transformers[key]) {
      throw new ReferenceError("The key for plugin " + JSON.stringify(name) + " of " + key + " collides with an existing plugin");
    }

    // validate Transformer instance
    if (!plugin.buildPass || plugin.constructor.name !== "Transformer") {
      throw new TypeError("Plugin " + JSON.stringify(name) + " didn't export default a Transformer instance");
    }

    // build!
    var pass = this.transformers[key] = plugin.buildPass(this);
    if (pass.canTransform()) {
      var stack = before;
      if (position === "after") stack = after;
      stack.push(pass);
    }
  };

  File.prototype.parseInputSourceMap = function parseInputSourceMap(code) {
    var opts = this.opts;

    if (opts.inputSourceMap !== false) {
      var inputMap = convertSourceMap.fromSource(code);
      if (inputMap) {
        opts.inputSourceMap = inputMap.toObject();
        code = convertSourceMap.removeComments(code);
      }
    }

    return code;
  };

  File.prototype.parseShebang = function parseShebang(code) {
    var shebangMatch = shebangRegex.exec(code);

    if (shebangMatch) {
      this.shebang = shebangMatch[0];

      // remove shebang
      code = code.replace(shebangRegex, "");
    }

    return code;
  };

  File.prototype.set = function set(key, val) {
    return this.data[key] = val;
  };

  File.prototype.setDynamic = function setDynamic(key, fn) {
    this.dynamicData[key] = fn;
  };

  File.prototype.get = function get(key) {
    var data = this.data[key];
    if (data) {
      return data;
    } else {
      var dynamic = this.dynamicData[key];
      if (dynamic) {
        return this.set(key, dynamic());
      }
    }
  };

  File.prototype.resolveModuleSource = (function (_resolveModuleSource) {
    var _resolveModuleSourceWrapper = function resolveModuleSource(_x) {
      return _resolveModuleSource.apply(this, arguments);
    };

    _resolveModuleSourceWrapper.toString = function () {
      return _resolveModuleSource.toString();
    };

    return _resolveModuleSourceWrapper;
  })(function (source) {
    var resolveModuleSource = this.opts.resolveModuleSource;
    if (resolveModuleSource) source = resolveModuleSource(source, this.opts.filename);
    return source;
  });

  File.prototype.addImport = function addImport(source, name, noDefault) {
    if (!name) name = source;

    var id = this.dynamicImportIds[name];

    if (!id) {
      source = this.resolveModuleSource(source);
      id = this.dynamicImportIds[name] = this.scope.generateUidIdentifier(name);

      var specifiers = [t.importDefaultSpecifier(id)];
      var declar = t.importDeclaration(specifiers, t.literal(source));
      declar._blockHoist = 3;

      this.dynamicImported.push(declar);
      if (noDefault) this.dynamicImportedNoDefault.push(declar);

      if (this.transformers["es6.modules"].canTransform()) {
        this.moduleFormatter.importSpecifier(specifiers[0], declar, this.dynamicImports);
        this.moduleFormatter.hasLocalImports = true;
      } else {
        this.dynamicImports.push(declar);
      }
    }

    return id;
  };

  File.prototype.isConsequenceExpressionStatement = function isConsequenceExpressionStatement(node) {
    return t.isExpressionStatement(node) && this.lastStatements.indexOf(node) >= 0;
  };

  File.prototype.attachAuxiliaryComment = function attachAuxiliaryComment(node) {
    var comment = this.opts.auxiliaryComment;
    if (comment) {
      var _node = node;
      if (!_node.leadingComments) _node.leadingComments = [];

      node.leadingComments.push({
        type: "Line",
        value: " " + comment
      });
    }
    return node;
  };

  File.prototype.addHelper = function addHelper(name) {
    if (!includes(File.helpers, name)) {
      throw new ReferenceError("Unknown helper " + name);
    }

    var program = this.ast.program;

    var declar = program._declarations && program._declarations[name];
    if (declar) return declar.id;

    this.usedHelpers[name] = true;

    var generator = this.get("helperGenerator");
    var runtime = this.get("helpersNamespace");
    if (generator) {
      return generator(name);
    } else if (runtime) {
      var id = t.identifier(t.toIdentifier(name));
      return t.memberExpression(runtime, id);
    } else {
      var ref = util.template("helper-" + name);
      ref._compact = true;
      var uid = this.scope.generateUidIdentifier(name);
      this.scope.push({
        key: name,
        id: uid,
        init: ref
      });
      return uid;
    }
  };

  File.prototype.errorWithNode = function errorWithNode(node, msg) {
    var Error = arguments[2] === undefined ? SyntaxError : arguments[2];

    var loc = node.loc.start;
    var err = new Error("Line " + loc.line + ": " + msg);
    err.loc = loc;
    return err;
  };

  File.prototype.addCode = function addCode(code) {
    code = (code || "") + "";
    code = this.parseInputSourceMap(code);
    this.code = code;
    return this.parseShebang(code);
  };

  File.prototype.shouldIgnore = function shouldIgnore() {
    var opts = this.opts;
    return util.shouldIgnore(opts.filename, opts.ignore, opts.only);
  };

  File.prototype.parse = (function (_parse) {
    var _parseWrapper = function parse(_x2) {
      return _parse.apply(this, arguments);
    };

    _parseWrapper.toString = function () {
      return _parse.toString();
    };

    return _parseWrapper;
  })(function (code) {
    var _this = this;

    if (this.shouldIgnore()) {
      return {
        metadata: {},
        code: code,
        map: null,
        ast: null
      };
    }

    code = this.addCode(code);

    var opts = this.opts;

    //

    var parseOpts = {
      highlightCode: opts.highlightCode,
      nonStandard: opts.nonStandard,
      filename: opts.filename,
      plugins: {}
    };

    var features = parseOpts.features = {};
    for (var key in this.transformers) {
      var transformer = this.transformers[key];
      features[key] = transformer.canTransform();
    }

    parseOpts.looseModules = this.isLoose("es6.modules");
    parseOpts.strictMode = features.strict;
    parseOpts.sourceType = "module";

    //

    return parse(parseOpts, code, function (tree) {
      _this.transform(tree);
      return _this.generate();
    });
  });

  File.prototype.setAst = function setAst(ast) {
    this.path = TraversalPath.get(null, null, ast, ast, "program", this);
    this.scope = this.path.scope;
    this.ast = ast;

    this.path.traverse({
      enter: function enter(node, parent, scope) {
        if (this.isScope()) {
          for (var key in scope.bindings) {
            scope.bindings[key].setTypeAnnotation();
          }
        }
      }
    });
  };

  File.prototype.transform = function transform(ast) {
    this.log.debug();

    this.setAst(ast);

    this.lastStatements = t.getLastStatements(ast.program);

    var modFormatter = this.moduleFormatter = this.getModuleFormatter(this.opts.modules);
    if (modFormatter.init && this.transformers["es6.modules"].canTransform()) {
      modFormatter.init();
    }

    this.checkNode(ast);

    this.call("pre");

    each(this.transformerStack, function (pass) {
      pass.transform();
    });

    this.call("post");
  };

  File.prototype.call = function call(key) {
    var stack = this.transformerStack;
    for (var i = 0; i < stack.length; i++) {
      var transformer = stack[i].transformer;
      var fn = transformer[key];
      if (fn) fn(this);
    }
  };

  File.prototype.checkNode = (function (_checkNode) {
    var _checkNodeWrapper = function checkNode(_x3, _x4) {
      return _checkNode.apply(this, arguments);
    };

    _checkNodeWrapper.toString = function () {
      return _checkNode.toString();
    };

    return _checkNodeWrapper;
  })(function (node, scope) {
    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i++) {
        this.checkNode(node[i], scope);
      }
      return;
    }

    var stack = this.transformerStack;
    if (!scope) scope = this.scope;

    checkNode(stack, node, scope);

    scope.traverse(node, checkTransformerVisitor, {
      stack: stack
    });
  });

  File.prototype.mergeSourceMap = function mergeSourceMap(map) {
    var opts = this.opts;

    var inputMap = opts.inputSourceMap;

    if (inputMap) {
      map.sources[0] = inputMap.file;

      var inputMapConsumer = new sourceMap.SourceMapConsumer(inputMap);
      var outputMapConsumer = new sourceMap.SourceMapConsumer(map);
      var outputMapGenerator = sourceMap.SourceMapGenerator.fromSourceMap(outputMapConsumer);
      outputMapGenerator.applySourceMap(inputMapConsumer);

      var mergedMap = outputMapGenerator.toJSON();
      mergedMap.sources = inputMap.sources;
      mergedMap.file = inputMap.file;
      return mergedMap;
    }

    return map;
  };

  File.prototype.generate = (function (_generate) {
    var _generateWrapper = function generate() {
      return _generate.apply(this, arguments);
    };

    _generateWrapper.toString = function () {
      return _generate.toString();
    };

    return _generateWrapper;
  })(function () {
    var opts = this.opts;
    var ast = this.ast;

    var result = {
      metadata: {},
      code: "",
      map: null,
      ast: null
    };

    if (this.opts.metadataUsedHelpers) {
      result.metadata.usedHelpers = Object.keys(this.usedHelpers);
    }

    if (opts.ast) result.ast = ast;
    if (!opts.code) return result;

    var _result = generate(ast, opts, this.code);
    result.code = _result.code;
    result.map = _result.map;

    if (this.shebang) {
      // add back shebang
      result.code = "" + this.shebang + "\n" + result.code;
    }

    if (result.map) {
      result.map = this.mergeSourceMap(result.map);
    }

    if (opts.sourceMaps === "inline" || opts.sourceMaps === "both") {
      result.code += "\n" + convertSourceMap.fromObject(result.map).toComment();
    }

    if (opts.sourceMaps === "inline") {
      result.map = null;
    }

    return result;
  });

  return File;
})();

module.exports = File;
