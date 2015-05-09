System.register('passagier/passagier', ['decorators/ng-decorators'], function (_export) {
  var Component, _classCallCheck, PassagierController;

  return {
    setters: [function (_decoratorsNgDecorators) {
      Component = _decoratorsNgDecorators.Component;
    }],
    execute: function () {
      'use strict';

      _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

      PassagierController = (function () {
        function PassagierController() {
          _classCallCheck(this, _PassagierController);
        }

        var _PassagierController = PassagierController;
        PassagierController = Component()(PassagierController) || PassagierController;
        return PassagierController;
      })();

      _export('PassagierController', PassagierController);
    }
  };
});
//# sourceMappingURL=../passagier/passagier.js.map
