System.register("home/home", ["decorators/ng-decorators"], function (_export) {
    var Component, _classCallCheck, HomeController;

    return {
        setters: [function (_decoratorsNgDecorators) {
            Component = _decoratorsNgDecorators.Component;
        }],
        execute: function () {
            "use strict";

            _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

            HomeController = (function () {
                function HomeController($log) {
                    _classCallCheck(this, _HomeController);

                    this.$log = $log;
                    $log.log("HomeController wurde gestartet");
                }

                var _HomeController = HomeController;
                HomeController = Component({
                    injectables: ["$log"]
                })(HomeController) || HomeController;
                return HomeController;
            })();

            _export("HomeController", HomeController);
        }
    };
});
//# sourceMappingURL=../home/home.js.map
