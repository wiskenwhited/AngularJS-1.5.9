"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var rxjs_1 = require('rxjs');
require('rxjs/add/operator/map');
var app_config_1 = require('../app.config');
var ApiService = (function () {
    function ApiService(http, config) {
        this.http = http;
        this.config = config;
        this.endpoint = this.config.apiUrl;
    }
    ApiService.prototype.process = function (response) {
        var json = response.json();
        if (json && json.errorMessage) {
            throw new Error(json.errorMessage);
        }
        return json;
    };
    ApiService.prototype.processError = function (error) {
        var errMsg = (error.message) ? error.message : error.status ? error.status + " - " + error.statusText : 'Server error';
        console.error(errMsg); // log to console instead
        return rxjs_1.Observable.throw(errMsg);
    };
    ApiService.prototype.getHeaders = function () {
        var headers = new http_1.Headers();
        if (this.getToken()) {
            headers.append('Authorization', this.getToken());
        }
        return {
            headers: headers
        };
    };
    ApiService.prototype.get = function (url) {
        // return this
        //     .http
        //     .get(url, this.getHeaders())
        //     .map(this.process)
        //     .catch(this.processError);
        return rxjs_1.Observable.fromPromise(Promise.resolve({}));
    };
    ApiService.prototype.post = function (url, data) {
        /*return Observable.fromPromise(Promise.resolve('token'));*/
        return this
            .http
            .post(url, data, this.getHeaders())
            .map(this.process);
    };
    ApiService.prototype.put = function (url, data) {
        return this
            .http
            .put(url, data, this.getHeaders())
            .map(this.process)
            .catch(this.processError);
    };
    ApiService.prototype.delete = function (url) {
        return this
            .http
            .delete(url, this.getHeaders())
            .map(this.process)
            .catch(this.processError);
    };
    ApiService.prototype.getToken = function () {
        return localStorage.getItem('this.config.jwtKey');
    };
    ApiService.prototype.setToken = function (token) {
        localStorage.setItem('this.config.jwtKey', token.token);
    };
    ApiService.prototype.deleteToken = function () {
        localStorage.removeItem('this.config.jwtKey');
    };
    ApiService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http, app_config_1.AppConfig])
    ], ApiService);
    return ApiService;
}());
exports.ApiService = ApiService;
//# sourceMappingURL=api.service.js.map