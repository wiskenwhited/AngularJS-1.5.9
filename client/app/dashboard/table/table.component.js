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
var http_1 = require('@angular/http');
var core_2 = require('@angular/core');
var app_config_1 = require('../../app.config');
require('rxjs/add/operator/map');
require('rxjs/add/operator/catch');
var ChargeHistory = (function () {
    function ChargeHistory() {
    }
    ChargeHistory = __decorate([
        core_2.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ChargeHistory);
    return ChargeHistory;
}());
exports.ChargeHistory = ChargeHistory;
var TableComponent = (function () {
    function TableComponent(route, http, url) {
        var _this = this;
        this.route = route;
        this.http = http;
        this.url = url;
        this.pages = 3;
        this.pageSize = 10;
        this.pageNumber = 3;
        this.currentIndex = 1;
        this.pageStart = 1;
        this.rowPerPage = [1, 10, 15, 20, 25];
        this.userID = localStorage.getItem('security');
        this.http.get(this.url.apiUrl + '/paypal/getChargeHistory/' + this.userID)
            .subscribe(function (res) {
            _this.filteredJobList = _this.pagination = _this.jobList = res.json(); // fetch the dnc data from server
            _this.init(); // table init
        }, function (err) { return console.log("No recharge history"); });
    }
    TableComponent.prototype.keep = function () {
        this.pages = 4;
        this.pageNumber = parseInt("" + (this.pagination.length / this.pageSize));
        if (this.pagination.length % this.pageSize != 0) {
            this.pageNumber++;
        }
        if (this.pageNumber < this.pages) {
            this.pages = this.pageNumber;
        }
    };
    TableComponent.prototype.init = function () {
        this.currentIndex = 1;
        this.pageStart = 1;
        this.pages = 4;
        this.pageNumber = parseInt("" + (this.pagination.length / this.pageSize));
        if (this.pagination.length % this.pageSize != 0) {
            this.pageNumber++;
        }
        if (this.pageNumber < this.pages) {
            this.pages = this.pageNumber;
        }
        this.refreshItems();
    };
    TableComponent.prototype.change = function (value) {
        this.pageSize = value;
        this.currentIndex = 1;
        this.pageStart = 1;
        this.pages = 4;
        this.pageNumber = parseInt("" + (this.pagination.length / this.pageSize));
        if (this.pagination.length % this.pageSize != 0) {
            this.pageNumber++;
        }
        if (this.pageNumber < this.pages) {
            this.pages = this.pageNumber;
        }
        this.refreshItems();
    };
    TableComponent.prototype.fillArray = function () {
        var obj = new Array();
        for (var index = this.pageStart; index < this.pageStart + this.pages; index++) {
            obj.push(index);
        }
        return obj;
    };
    TableComponent.prototype.refreshItems = function () {
        this.filteredJobList = this.pagination.slice((this.currentIndex - 1) * this.pageSize, (this.currentIndex) * this.pageSize);
        this.pagesIndex = this.fillArray();
    };
    TableComponent.prototype.prevPage = function () {
        if (this.currentIndex > 1) {
            this.currentIndex--;
        }
        if (this.currentIndex < this.pageStart) {
            this.pageStart = this.currentIndex;
        }
        this.refreshItems();
    };
    TableComponent.prototype.nextPage = function () {
        if (this.currentIndex < this.pageNumber) {
            this.currentIndex++;
        }
        if (this.currentIndex >= (this.pageStart + this.pages)) {
            this.pageStart = this.currentIndex - this.pages + 1;
        }
        this.refreshItems();
    };
    TableComponent.prototype.setPage = function (index) {
        this.currentIndex = index;
        this.refreshItems();
    };
    TableComponent.prototype.update = function () {
        var _this = this;
        this.http.get(this.url.apiUrl).subscribe(function (filedata) {
            _this.pagination = _this.filteredJobList = _this.jobList = filedata.json();
            _this.init();
        }, function (error) { return _this.jobList = error.text(); });
    };
    ;
    // Search bar process
    TableComponent.prototype.filter = function (filterKey) {
        filterKey = filterKey.toLowerCase();
        if (filterKey === "") {
            this.pagination = this.jobList;
            this.init();
            return;
        }
        this.pagination = this.filteredJobList = this.jobList.filter(function (brand) { return (brand.date.toLowerCase().indexOf(filterKey) != -1); });
        this.init();
    };
    TableComponent.prototype.handleError = function (error) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        var errMsg = (error.message) ? error.message :
            error.status ? error.status + " - " + error.statusText : 'Server error';
        console.error(errMsg); // log to console instead
        return errMsg;
    };
    TableComponent = __decorate([
        core_1.Component({
            selector: 'table-cmp',
            moduleId: module.id,
            templateUrl: 'table.component.html',
            styleUrls: ['../table.component.css']
        }), 
        __metadata('design:paramtypes', [router_1.Router, http_1.Http, app_config_1.AppConfig])
    ], TableComponent);
    return TableComponent;
}());
exports.TableComponent = TableComponent;
//# sourceMappingURL=table.component.js.map