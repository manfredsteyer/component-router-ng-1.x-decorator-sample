System.register('app', ['angular', 'node_modules/angular-new-router/dist/router.es5', 'home/home', 'flug-buchen/flug-buchen', 'passagier/passagier', 'flug/flug', 'buchen/buchen', 'passagier-edit/passagier-edit', 'decorators/ng-decorators'], function (_export) {
    var angular, newRouter, HomeController, FlugBuchenController, PassagierController, FlugController, BuchenController, PassagierEditController, Registry, Component, Inject, _classCallCheck, AppController, app;

    return {
        setters: [function (_angular) {
            angular = _angular['default'];
        }, function (_node_modulesAngularNewRouterDistRouterEs5) {
            newRouter = _node_modulesAngularNewRouterDistRouterEs5['default'];
        }, function (_homeHome) {
            HomeController = _homeHome.HomeController;
        }, function (_flugBuchenFlugBuchen) {
            FlugBuchenController = _flugBuchenFlugBuchen.FlugBuchenController;
        }, function (_passagierPassagier) {
            PassagierController = _passagierPassagier.PassagierController;
        }, function (_flugFlug) {
            FlugController = _flugFlug.FlugController;
        }, function (_buchenBuchen) {
            BuchenController = _buchenBuchen.BuchenController;
        }, function (_passagierEditPassagierEdit) {
            PassagierEditController = _passagierEditPassagierEdit.PassagierEditController;
        }, function (_decoratorsNgDecorators) {
            Registry = _decoratorsNgDecorators.Registry;
            Component = _decoratorsNgDecorators.Component;
            Inject = _decoratorsNgDecorators.Inject;
        }],
        execute: function () {
            'use strict';

            _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

            AppController = (function () {
                function AppController($router) {
                    _classCallCheck(this, _AppController);

                    $router.config([{ path: '/', component: 'home' }, { path: '/flugbuchen', component: 'flugBuchen' }]);
                }

                var _AppController = AppController;
                AppController = Component()(AppController) || AppController;
                AppController = Inject('$router')(AppController) || AppController;
                return AppController;
            })();

            app = angular.module('app', ['ngNewRouter']);

            Registry.toModule(app);

            /*
            app.controller('AppController', AppController);
            app.controller('HomeController', HomeController);
            app.controller('FlugBuchenController', FlugBuchenController);
            app.controller('PassagierController', PassagierController);
            app.controller('FlugController', FlugController);
            app.controller('BuchenController', BuchenController);
            app.controller('PassagierEditController', PassagierEditController);
            */

            app.constant('baseUrl', 'http://www.angular.at');

            angular.element(document).ready(function () {
                angular.bootstrap(document, ['app']);
            });
        }
    };
});
//# sourceMappingURL=app.js.map
