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
var Siftjob = (function () {
    function Siftjob() {
    }
    Siftjob = __decorate([
        core_2.Injectable(), 
        __metadata('design:paramtypes', [])
    ], Siftjob);
    return Siftjob;
}());
exports.Siftjob = Siftjob;
var HomeComponent = (function () {
    function HomeComponent(route, http, url, e1) {
        this.route = route;
        this.http = http;
        this.url = url;
        this.e1 = e1;
        this.pages = 3;
        this.pageSize = 10;
        this.pageNumber = 3;
        this.currentIndex = 1;
        this.memoIndex = 1;
        this.pageStart = 1;
        this.rowPerPage = [5, 10, 15, 20, 25];
        this.taskList = [];
        this.activeList = [];
        this.completedList = [];
        this.sort = 'All';
        this.uploadMode = true;
        this.activeMode = true;
        this.csvUrl = ''; // URL to web API
        this.csvData = [];
        this.price = 1000;
        this.balance = '0';
        this.userID = localStorage.getItem('security');
        this.searchResult = [];
        this.checkbox = [false];
        this.count = 0;
        var that = this;
        setInterval(function () {
            that.getAll();
        }, 3000);
    }
    HomeComponent.prototype.ngOnInit = function () {
        this.getAll();
    };
    // Cancel  Job process
    HomeComponent.prototype.abc = function (index) {
        var jobID = this.filteredJobList[index]['id'];
        this.delJobID = jobID;
        $('#cancelled').click();
    };
    HomeComponent.prototype.changeState = function (type) {
        this.sort = type;
        this.actvieJob();
    };
    HomeComponent.prototype.lid = function () {
        this.http.get(this.url.apiUrl + '/dnc/delete/' + this.delJobID)
            .toPromise()
            .then(function (res) {
            $('#jobcancel').hide();
        })
            .catch(function (err) { return console.log(err); });
    };
    HomeComponent.prototype.getAll = function () {
        var _this = this;
        this.memoIndex = this.currentIndex;
        if (this.activeList.length > 0)
            this.activeList = [];
        if (this.taskList.length > 0)
            this.taskList = [];
        this.http.get(this.url.apiUrl + '/dnc/getAll/' + this.userID)
            .subscribe(function (res) {
            _this.filteredJobList = _this.pagination = _this.jobList = res.json(); // fetch the dnc data from server
            if (_this.activeList.length > 0)
                _this.activeList = [];
            if (_this.taskList.length > 0)
                _this.taskList = [];
            _this.jobList.forEach(function (val) {
                if (val['payment_status'] == false) {
                    _this.taskList.push(val);
                }
                else {
                    _this.activeList.push(val);
                }
            });
            _this.actvieJob();
        });
    };
    // Detect inactive job list from the db
    HomeComponent.prototype.dncCheck = function () {
        // Progress the dnc job
        if (this.taskList && this.taskList.length > 0) {
            var val = this.taskList.pop();
            if (val['status'] == 'stopped') {
                this.http.get(this.url.apiUrl + '/dnc/process/' + this.userID + '/' + val['real_filename'])
                    .toPromise()
                    .then(function (res) { return console.log('ok'); });
            }
        }
    };
    HomeComponent.prototype.pay = function (index) {
        this.jobID = this.filteredJobList[index]['id'];
        var cost = this.filteredJobList[index]['total_cost'];
        var realCost = parseFloat(cost).toFixed(2);
        $('.cost').text(cost);
        $('.costValue').val(realCost);
        window.jobID = parseFloat(this.jobID);
        window.price = parseFloat(realCost);
        if (this.jobID) {
            $('.inputPrice').click();
        }
    };
    // Upload the csv file
    HomeComponent.prototype.spec = function () {
        this.uploadMode = false;
        if (!this.uploadMode) {
            $('.dropZoneArea, .dropZone1').css({ 'display': 'block' });
            var that = this;
            this.uploadScan = setInterval(function () {
                that.detectChange();
                if (that.uploadMode) {
                    clearInterval(that.uploadScan);
                    $('.dropZoneArea, .dropZone1').css({ 'display': 'none' });
                }
            }, 1000);
        }
    };
    // Active/Inactive job
    HomeComponent.prototype.actvieJob = function () {
        if (this.sort == 'All') {
            this.pagination = this.jobList;
        }
        else if (this.sort == 'Completed') {
            this.pagination = this.activeList;
        }
        else if (this.sort == 'Active') {
            this.pagination = this.taskList;
        }
        this.refreshItems(); // table init
        this.currentIndex = this.memoIndex;
        var searchKey = $('#typesearch').val();
        if (this.searchResult && this.searchResult.length > 0 && searchKey !== '') {
            this.filteredJobList = this.searchResult;
        }
    };
    HomeComponent.prototype.getItems = function () {
        var _this = this;
        this.count = 0;
        this.checkbox.forEach(function (val) {
            if (val) {
                _this.count++;
            }
        });
    };
    // Download the dnc job
    HomeComponent.prototype.download = function (type, index) {
        var _this = this;
        // var filename = [];
        // for (var i=0; i<this.checkbox.length; i++) {
        //     if (this.checkbox[i])             {
        //         filename.push(this.filteredJobList[i]['real_filename']);
        //     }
        // }
        var real_filename = this.filteredJobList[index]['real_filename'];
        // filename.forEach(element => {
        if (real_filename)
            this.http.get(this.url.apiUrl + "/dnc/download/" + type + '/' + this.userID + '/' + real_filename)
                .toPromise()
                .then(function (res) {
                _this.downloadlink = _this.url.apiUrl + res.text();
                $("#download").attr("href", _this.downloadlink);
                if (res.text() && res.text() != null && _this.downloadlink !== null) {
                    document.getElementById('download').click();
                }
            })
                .catch(function (err) {
                $('#down-alert').click();
            });
        // });
    };
    HomeComponent.prototype.keep = function () {
        this.pages = 4;
        this.pageNumber = parseInt("" + (this.pagination.length / this.pageSize));
        if (this.pagination.length % this.pageSize != 0) {
            this.pageNumber++;
        }
        if (this.pageNumber < this.pages) {
            this.pages = this.pageNumber;
        }
    };
    HomeComponent.prototype.init = function () {
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
    HomeComponent.prototype.change = function (value) {
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
    HomeComponent.prototype.fillArray = function () {
        var obj = new Array();
        for (var index = this.pageStart; index < this.pageStart + this.pages; index++) {
            obj.push(index);
        }
        return obj;
    };
    HomeComponent.prototype.refreshItems = function () {
        this.filteredJobList = this.pagination.slice((this.currentIndex - 1) * this.pageSize, (this.currentIndex) * this.pageSize);
        this.pagesIndex = this.fillArray();
    };
    HomeComponent.prototype.prevPage = function () {
        if (this.currentIndex > 1) {
            this.currentIndex--;
        }
        if (this.currentIndex < this.pageStart) {
            this.pageStart = this.currentIndex;
        }
        this.refreshItems();
    };
    HomeComponent.prototype.nextPage = function () {
        if (this.currentIndex < this.pageNumber) {
            this.currentIndex++;
        }
        if (this.currentIndex >= (this.pageStart + this.pages)) {
            this.pageStart = this.currentIndex - this.pages + 1;
        }
        this.refreshItems();
    };
    HomeComponent.prototype.setPage = function (index) {
        this.currentIndex = index;
        this.refreshItems();
    };
    HomeComponent.prototype.update = function () {
        var _this = this;
        this.http.get(this.url.apiUrl).subscribe(function (filedata) {
            _this.pagination = _this.filteredJobList = _this.jobList = filedata.json();
            _this.init();
        }, function (error) { return _this.jobList = error.text(); });
    };
    ;
    // Search bar process
    HomeComponent.prototype.filter = function (filterKey) {
        filterKey = filterKey.toLowerCase();
        if (filterKey === "") {
            this.pagination = this.jobList;
            this.init();
            return;
        }
        this.pagination = this.filteredJobList = this.jobList.filter(function (brand) { return (brand.filename.toLowerCase().indexOf(filterKey) != -1); });
        this.searchResult = this.filteredJobList;
        this.init();
    };
    HomeComponent.prototype.uploadData = function (event) {
        var inputFile = this.inputFile.nativeElement;
        var fileCount = inputFile.files.length;
        var formData = new FormData();
        var filename = inputFile.files[0].name;
        this.csvUrl = URL.createObjectURL(event.target.files[0]);
        this.detectChange();
    };
    HomeComponent.prototype.readCsvData = function () {
        var _this = this;
        var dropUrl = $('.urlValue').val();
        var url;
        if (dropUrl)
            url = dropUrl;
        else
            url = this.csvUrl;
        if (url)
            this.http.get(url)
                .subscribe(function (data) { return _this.extractData(data); }, function (err) { return _this.handleError(err); });
    };
    HomeComponent.prototype.extractData = function (res) {
        var csvData = res['_body'] || '';
        var allTextLines = csvData.split(/\r\n|\n/);
        var headers = allTextLines[0].split(',');
        var lines = [];
        for (var i = 0; i < allTextLines.length; i++) {
            // split content based on comma
            var data = allTextLines[i].split(',');
            if (data.length == headers.length) {
                var tarr = [];
                for (var j = 0; j < headers.length; j++) {
                    tarr.push(data[j]);
                }
                lines.push(tarr);
            }
        }
    };
    HomeComponent.prototype.detectChange = function () {
        var _this = this;
        var files = window.uploadFile;
        if (!files) {
            return;
        }
        window.uploadFile = null;
        this.uploadMode = true;
        var fileCount;
        if (files) {
            fileCount = files.length;
        }
        else {
            fileCount = 0;
        }
        var formData = new FormData();
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        var options = new http_1.RequestOptions({ headers: headers });
        if (fileCount > 0) {
            for (var i = 0; i < fileCount; i++) {
                formData.append('uploads', files.item(i), files.item(i).name);
            }
            this.http.post(this.url.apiUrl + '/dnc/uploadcsv/' + window.csvFileName + '/' + this.userID + '/' + window.balance, formData)
                .subscribe(function (res) {
                _this.ngOnInit();
            });
        }
    };
    HomeComponent.prototype.handleError = function (error) {
        var errMsg = (error.message) ? error.message :
            error.status ? error.status + " - " + error.statusText : 'Server error';
        console.error(errMsg); // log to console instead
        return errMsg;
    };
    __decorate([
        core_2.ViewChild('upload-btn'), 
        __metadata('design:type', Object)
    ], HomeComponent.prototype, "uploadbtn", void 0);
    __decorate([
        core_2.ViewChild('inputFile'), 
        __metadata('design:type', core_2.ElementRef)
    ], HomeComponent.prototype, "inputFile", void 0);
    HomeComponent = __decorate([
        core_1.Component({
            selector: 'home-cmp',
            styleUrls: ['../table.component.css', './home.component.css'],
            moduleId: module.id,
            templateUrl: 'home.component.html'
        }), 
        __metadata('design:paramtypes', [router_1.Router, http_1.Http, app_config_1.AppConfig, core_2.ElementRef])
    ], HomeComponent);
    return HomeComponent;
}());
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=home.component.js.map