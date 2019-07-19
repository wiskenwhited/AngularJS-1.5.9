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
var sidebar_routes_config_1 = require('../.././sidebar/sidebar-routes.config');
var common_1 = require('@angular/common');
var core_2 = require('@angular/core');
var http_1 = require('@angular/http');
var router_1 = require('@angular/router');
var app_config_1 = require('../../app.config');
var NavbarComponent = (function () {
    function NavbarComponent(location, e1, http, route, url) {
        this.e1 = e1;
        this.http = http;
        this.route = route;
        this.url = url;
        this.uploadMode = false;
        this.csvUrl = ''; // URL to web API
        this.csvData = [];
        this.price = 1000;
        this.balance = 0;
        this.userID = localStorage.getItem('security');
        this.navStatus = false;
        this.location = location;
        this.price = 0; // initial price
        this.payment();
    }
    NavbarComponent.prototype.ngOnInit = function () {
        this.listTitles = sidebar_routes_config_1.ROUTES.filter(function (listTitle) { return listTitle; });
        window.renderPaypal();
    };
    NavbarComponent.prototype.getBalance = function () {
        var _this = this;
        this.http.get(this.url.apiUrl + '/paypal/balance/' + this.userID)
            .toPromise()
            .then(function (res) {
            var balance = res.json().balance;
            if (isNaN(balance) || parseFloat(balance) <= 0) {
            }
            else {
                $('#balanceAlert').hide();
                _this.balance = res.json().balance;
            }
        })
            .catch(function (err) {
            this.handleError(err);
        });
    };
    NavbarComponent.prototype.payment = function () {
        // console.log(this.price + "payment function");
        this.price = parseFloat($('.cost').text());
        if (this.price == undefined || this.price == null || this.price < 0)
            return;
        window.price = this.price;
        var that = this;
        this.scan = setInterval(function () {
            var paymentEvent = window.paymentSuccess;
            if (paymentEvent == 'paid') {
                that.balance = Number.parseFloat(that.balance) + window.price;
                $('#myModal').hide();
                clearInterval(that.scan);
                paymentEvent = null;
                window.paymentSuccess = null;
                that.emailConfirm();
                that.switchJobStatus();
                that.rechargeHistory();
            }
        }, 1000);
    };
    NavbarComponent.prototype.saveBalance = function () {
        var _this = this;
        var body = {
            userID: this.userID,
            balance: this.balance
        };
        console.log("saveBalance", body);
        this.http.post(this.url.apiUrl + '/paypal/balance', body)
            .toPromise()
            .then(function (res) { return _this.balance = res.text(); })
            .catch(function (error) { return _this.handleError(error); });
    };
    NavbarComponent.prototype.emailConfirm = function () {
        this.http.get(this.url.apiUrl + '/paypal/emailConfirm/' + this.userID)
            .toPromise()
            .then(function (res) { return console.log(res); })
            .catch(function (err) { return console.log(err); });
    };
    NavbarComponent.prototype.rechargeHistory = function () {
        var _this = this;
        var body = {
            confirmation_id: window.paymentID,
            payment_amount: window.price,
            prev_balance: window.price,
            new_balance: window.price,
            user_id: window.payerID,
            job_name: window.jobID
        };
        console.log(body);
        this.http.post(this.url.apiUrl + '/paypal/history/' + this.userID, body)
            .toPromise()
            .then(function (res) { return console.log(res); })
            .catch(function (err) { return _this.handleError(err); });
    };
    NavbarComponent.prototype.switchJobStatus = function () {
        this.http.get(this.url.apiUrl + '/dnc/setStatus/' + window.jobID)
            .toPromise()
            .then(function (res) {
            console.log("setstatus changed paid");
        });
    };
    NavbarComponent.prototype.handleError = function (error) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        var errMsg = (error.message) ? error.message :
            error.status ? error.status + " - " + error.statusText : 'Server error';
        console.error(errMsg); // log to console instead
        return errMsg;
    };
    NavbarComponent.prototype.logout = function () {
        localStorage.removeItem('telecomUser');
        localStorage.removeItem('mailC');
        localStorage.removeItem('security');
        localStorage.removeItem('user');
        this.route.navigateByUrl('login');
    };
    NavbarComponent.prototype.navBar = function () {
        this.navStatus = !this.navStatus;
        if (this.navStatus) {
            $('.sidebar').css({ 'display': 'none' });
            $('.main-panel').css({ 'width': '100%' });
        }
        else {
            $('.sidebar').css({ 'display': 'block' });
            $('.main-panel').attr('style', '');
        }
    };
    NavbarComponent.prototype.getTitle = function () {
        var titlee = this.location.prepareExternalUrl(this.location.path());
        if (titlee.charAt(0) === '#') {
            titlee = titlee.slice(12);
        }
        for (var item = 0; item < this.listTitles.length; item++) {
            if (this.listTitles[item].path === titlee) {
                return this.listTitles[item].title;
            }
        }
        return 'Dashboard';
    };
    __decorate([
        core_2.ViewChild('upload-btn'), 
        __metadata('design:type', Object)
    ], NavbarComponent.prototype, "uploadbtn", void 0);
    __decorate([
        core_2.ViewChild('inputFile'), 
        __metadata('design:type', core_2.ElementRef)
    ], NavbarComponent.prototype, "inputFile", void 0);
    NavbarComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'navbar-cmp',
            templateUrl: 'navbar.component.html',
            styleUrls: ['./navbar.component.css']
        }), 
        __metadata('design:paramtypes', [common_1.Location, core_2.ElementRef, http_1.Http, router_1.Router, app_config_1.AppConfig])
    ], NavbarComponent);
    return NavbarComponent;
}());
exports.NavbarComponent = NavbarComponent;
//# sourceMappingURL=navbar.component.js.map