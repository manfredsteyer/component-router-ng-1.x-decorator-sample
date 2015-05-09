System.register('decorators/ng-decorators', ['angular'], function (_export) {
    var angular, Registry;

    _export('Inject', Inject);

    _export('Component', Component);

    function Inject() {
        for (var _len = arguments.length, deps = Array(_len), _key = 0; _key < _len; _key++) {
            deps[_key] = arguments[_key];
        }

        return function (target) {
            target.$inject = deps;
        };
    }

    function Component(options) {

        if (!options) options = {};
        moduleName = options.module || 'app';
        return function (target) {
            Registry.controllers.push({
                controller: target,
                name: target.name,
                moduleName: moduleName
            });

            if (options.injectables) {
                target.$inject = options.injectables;
            }
        };
    }

    return {
        setters: [function (_angular) {
            angular = _angular['default'];
        }],
        execute: function () {
            'use strict';

            Registry = {
                controllers: [],
                toModule: function toModule(angularModule) {
                    var _this = this;

                    angular.forEach(Registry.controllers, function (entry) {

                        angular.module(entry.moduleName).controller(entry.name, entry.controller);

                        _this.controllers = [];
                    });
                }
            };

            _export('Registry', Registry);
        }
    };
});
//# sourceMappingURL=../decorators/ng-decorators.js.map
