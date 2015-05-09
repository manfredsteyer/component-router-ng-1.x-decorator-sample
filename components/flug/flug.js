System.register('flug/flug', ['decorators/ng-decorators'], function (_export) {
  var Component, _classCallCheck, FlugController;

  return {
    setters: [function (_decoratorsNgDecorators) {
      Component = _decoratorsNgDecorators.Component;
    }],
    execute: function () {
      'use strict';

      _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

      FlugController = (function () {
        function FlugController() {
          _classCallCheck(this, _FlugController);
        }

        var _FlugController = FlugController;
        FlugController = Component()(FlugController) || FlugController;
        return FlugController;
      })();

      _export('FlugController', FlugController);
    }
  };
});
//# sourceMappingURL=../flug/flug.js.map
