import { Component } from 'decorators/ng-decorators';

@Component()
export class PassagierEditController {

    constructor($http, $log, baseUrl, $window, $routeParams) {
        this.$http = $http;
        this.$log = $log;
        this.baseUrl = baseUrl;
        this.$window = $window;
        
        this.exitWarning = {
            show: false  
        }
        
        this.load($routeParams.id);
    }

    canActivate() {
        this.$log.info("canActivate"); 
        return true;
    }
    
    activate($scope) {
        this.$scope = $scope;
        this.$log.info("activate");    
        return true;
    }
    
    canDeactivate($q) {
        
        
        if(!this.$scope.form.$dirty) return true;
        
        return new $q((resolve, reject) => {
            this.exitWarning = {
                show: true,
                resolve: resolve,
                reject: reject
            }
        }).finally(() => { 
            this.exitWarning.show = false;
        });
        
        
       
        
    }
    
    deactivate() {
        this.$log.info("deactivate");   
        return true;
    }
    
    load(id) {
        var that = this;

        var params = {};
        params.pNummer = id;

        this.$http
            .get(that.baseUrl + "/api/passagier", { params: params })
            .then((result) => {

                that.passagier = result.data;

            }).catch((p) => {
            
                that.message = "Beim Laden der Daten ist ein Fehler aufgetreten";
                that.$log.error("Fehler beim Laden von Passagieren");
                that.$log.error(p.data.message);
                that.$log.error(p.data.status);
            
            });
    }

    save() {
        var that = this;

        this
            .$http
            .post(that.baseUrl + "/api/passagier", this.passagier)
            .then((result) => {
                that.message = "Passagier wurde gespeichert!";
                that.$scope.form.$setDirty(false);
            })
            .catch((p) => {
                that.message = "Beim Speichern der Daten ist ein Fehler aufgetreten: "  + p.data;

                that.$log.error("Fehler beim Speichern von Passagieren: ");
                that.$log.error(p.data);
                that.$log.error(p.status);

            });

    }

    clearMessage() {
        this.message = null;
    }

}