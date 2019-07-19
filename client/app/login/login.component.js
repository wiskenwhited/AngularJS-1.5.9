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
var router_1 = require('@angular/router');
var common_1 = require('@angular/common');
var http_1 = require('@angular/http');
var app_config_1 = require('../app.config');
require('rxjs/add/operator/toPromise');
var Signup = (function () {
    function Signup() {
    }
    return Signup;
}());
exports.Signup = Signup;
var Signin = (function () {
    function Signin() {
    }
    return Signin;
}());
exports.Signin = Signin;
var LoginComponent = (function () {
    function LoginComponent(router, http, url, location) {
        this.router = router;
        this.http = http;
        this.url = url;
        this.location = location;
        this.mode = false;
        this.selectedTab = 0;
        this.isValid = false;
        this.isValid1 = false;
        this.signup = {
            fullname: '',
            email: '',
            pass1: '',
            pass2: '',
            promo_code: '',
            userType: ''
        };
        this.signin = {
            smail: '',
            password: '',
            memo: false
        };
        this.userTypes = [
            { value: '1', viewValue: 'Urgent' },
            { value: '2', viewValue: 'Normal' },
        ];
        this.result = false;
        this.fail = false;
        this.customMatch = false;
        this.wrongPass = false;
        this.emailConfirm = false;
        this.socialConfirm = false;
        this.validate();
    }
    LoginComponent.prototype.validate = function () {
        var _this = this;
        var route = this.router.url;
        var parseroute = this.router.parseUrl(route).queryParams;
        var _token;
        var that = this;
        if (parseroute['_token'] !== null && parseroute['_token'] !== undefined) {
            _token = parseroute['_token'];
            localStorage.setItem('mailC', _token);
        }
        var token = localStorage.getItem('telecomUser');
        _token = localStorage.getItem('mailC');
        if (token && token !== undefined)
            that.param = token;
        if (_token && _token !== undefined)
            that.param = _token;
        if (that.param && that.param !== undefined && that.param !== null) {
            this.http.get(this.url.apiUrl + '/user/verify/' + that.param)
                .toPromise().then(function (res) {
                if (res.text() !== 'ok')
                    localStorage.setItem('security', res.text());
                _this.redirect('dashboard');
            });
        }
        else {
            var confirm = parseroute['account'];
            if (confirm && confirm !== undefined)
                this.emailConfirm = true;
            setTimeout(function () {
                $('#signUptab').trigger('click');
            }, 500);
        }
    };
    LoginComponent.prototype.isValidForm = function () {
        return this.isValid;
    };
    LoginComponent.prototype.match = function () {
        if (this.signup.pass1 === this.signup.pass2) {
            this.customMatch = false;
        }
        else
            this.customMatch = true;
    };
    LoginComponent.prototype.enroll = function (type) {
        var oAuthURL = this.url.apiUrl + '/auth/' + type;
        // window.location.href = oAuthURL;
        var win = window.open(oAuthURL, 'Authentication', 'left=650,top=250,width=500,height=500,modal=yes,alwaysRaised=yes');
        this.remove();
        var that = this;
        var checkConnect;
        window.addEventListener("message", function (event) {
            if (event.origin !== that.url.apiUrl)
                return;
            clearInterval(checkConnect);
            win = null;
            var response = event.data;
            if (response == 'success') {
                var token = localStorage.setItem("telecomUser", response);
                that.http.get(that.url.apiUrl + '/user/gettoken')
                    .toPromise().then(function (res) {
                    localStorage.setItem('security', res.text());
                    that.socialConfirm = false;
                    that.redirect('dashboard');
                }, function (err) { return console.log(err); })
                    .catch(function (err) {
                    console.log("token error occured", err);
                });
            }
            else if (response == 'failed' || response == undefined || response == null) {
                that.socialConfirm = true;
            }
        }, false);
        win.postMessage("confirm", this.url.apiUrl);
        checkConnect = setInterval(function () {
            win.postMessage("confirm", that.url.apiUrl);
            if (!win || !win.closed)
                return;
            clearInterval(checkConnect);
        }, 1000);
    };
    LoginComponent.prototype.remove = function () {
        this.socialConfirm = false;
        this.isValid = false;
        this.fail = false;
        this.result = false;
        this.wrongPass = false;
    };
    LoginComponent.prototype.signIn = function (form) {
        var _this = this;
        this.remove();
        if (form.valid)
            for (var field in form.controls) {
                var ctrl = form.controls[field];
                ctrl.markAsTouched();
            }
        else
            return;
        this.http.post(this.url.apiUrl + '/user/login', this.signin)
            .toPromise()
            .then(function (response) {
            var res = response.text();
            var arr = res.split(',');
            var token = arr[0];
            var userId = arr[1];
            localStorage.setItem("security", userId);
            localStorage.setItem("telecomUser", token);
            _this.redirect('dashboard');
        }, function (fail) { _this.wrongPass = true; });
    };
    LoginComponent.prototype.signUp = function (form) {
        var _this = this;
        this.remove();
        if (form.valid && !this.customMatch)
            for (var field in form.controls) {
                var ctrl = form.controls[field];
                ctrl.markAsTouched();
            }
        else
            return;
        this.isValid = true;
        this.http.post(this.url.apiUrl + '/user/create', this.signup)
            .toPromise().then(function (response) {
            _this.result = true;
        }, function (err) {
            _this.fail = true;
            _this.isValid = false;
        });
    };
    LoginComponent.prototype.redirect = function (redirectLink) {
        this.router.navigateByUrl(redirectLink);
    };
    LoginComponent = __decorate([
        core_1.Component({
            selector: 'login-cmp',
            templateUrl: './login.component.html',
            moduleId: module.id,
            styleUrls: ['./login.component.css']
        }), 
        __metadata('design:paramtypes', [router_1.Router, http_1.Http, app_config_1.AppConfig, common_1.Location])
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=login.component.js.map