import { Component } from 'decorators/ng-decorators';

@Component({
    injectables: ["$log"]
})
export class HomeController {
    constructor($log) {
        this.$log = $log;
        $log.log("HomeController wurde gestartet");
    }
}