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
var api_service_1 = require('./api.service');
var Observable_1 = require('rxjs/Observable');
var app_config_1 = require('../app.config');
var ProfileService = (function () {
    function ProfileService(api, url) {
        var _this = this;
        this.api = api;
        this.url = url;
        this.token = [];
        this.status = new Observable_1.Observable(function (observer) {
            return _this.observer = observer;
        });
    }
    ProfileService.prototype.changeState = function (newState) {
        if (this.observer !== undefined)
            this.observer.next(newState);
    };
    ProfileService.prototype.isLoggedIn = function () {
        var _this = this;
        var token = this.api.getToken();
        if (!token) {
            this.changeState(false);
            return Observable_1.Observable.fromPromise(Promise.resolve(false));
        }
        return this
            .api // <- you can amend that for you API
            .get('profile/me')
            .map(function (response) {
            _this.profile = response;
            _this.loggedIn = true;
            _this.changeState(true);
            return true;
        });
    };
    ProfileService.prototype.login = function (username, password) {
        var _this = this;
        return this.api
            .post(this.url.apiUrl + '/managers/authenticate', {
            username: username,
            password: password
        })
            .flatMap(function (data) {
            _this.api.setToken(data);
            return _this.isLoggedIn();
        });
    };
    ProfileService.prototype.logout = function () {
        this.api.deleteToken();
        this.loggedIn = false;
        this.changeState(false);
    };
    ProfileService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [api_service_1.ApiService, app_config_1.AppConfig])
    ], ProfileService);
    return ProfileService;
}());
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map