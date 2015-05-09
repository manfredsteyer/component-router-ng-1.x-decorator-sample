System.register('buchen/buchen', ['decorators/ng-decorators'], function (_export) {
  var Component, _classCallCheck, BuchenController;

  return {
    setters: [function (_decoratorsNgDecorators) {
      Component = _decoratorsNgDecorators.Component;
    }],
    execute: function () {
      'use strict';

      _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

      BuchenController = (function () {
        function BuchenController() {
          _classCallCheck(this, _BuchenController);
        }

        var _BuchenController = BuchenController;
        BuchenController = Component()(BuchenController) || BuchenController;
        return BuchenController;
      })();

      _export('BuchenController', BuchenController);
    }
  };
});
//# sourceMappingURL=../buchen/buchen.js.map
