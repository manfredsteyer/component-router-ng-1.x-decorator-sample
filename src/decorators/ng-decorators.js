import angular from 'angular';

export function Inject(...deps) {
    return function(target) {
        target.$inject = deps;
    }
}

export function Component(options) {
    
    if (!options) options = {};
    moduleName = options.module || 'app';
    return function(target) {
        Registry.controllers.push({
            controller: target,
            name: target.name,
            moduleName: moduleName
        });
        
        if (options.injectables) {
            target.$inject = options.injectables;   
        }
    }
}
    
export var Registry = {
    controllers: [],
    toModule(angularModule) {
        angular.forEach(Registry.controllers, (entry) => { 
            
            angular
                .module(entry.moduleName)
                .controller(entry.name, entry.controller);
            
            this.controllers = [];
            
        });    
    }
}

