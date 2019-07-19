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
var core_2 = require('@angular/core');
var http_1 = require('@angular/http');
var app_config_1 = require('../../app.config');
var UserProfile = (function () {
    function UserProfile() {
    }
    return UserProfile;
}());
exports.UserProfile = UserProfile;
var UserComponent = (function () {
    function UserComponent(route, http, url, e1) {
        this.route = route;
        this.http = http;
        this.url = url;
        this.e1 = e1;
        this.profile = {};
        this.alert = false;
        this.user = {
            company: '',
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            address: '',
            city: '',
            country: '',
            postal_code: '',
            overview: '',
            password: '',
            confirm_password: ''
        };
        this.userID = localStorage.getItem('security');
    }
    UserComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.http.get(this.url.apiUrl + '/user/getProfile/' + this.userID)
            .subscribe(function (res) {
            _this.profile = res.json();
            _this.username = _this.profile[0].name;
            _this.photo = _this.profile[0].photo;
            if (!_this.photo) {
                _this.photo = '/assets/img/faces/photo.jpg';
            }
        }, function (err) {
            console.log(err);
        });
    };
    UserComponent.prototype.save = function () {
        console.log(this.user);
        this.http.post(this.url.apiUrl + '/user/setProfile/' + this.userID, this.user)
            .subscribe(function (res) {
            console.log("saved successfully");
        });
    };
    UserComponent.prototype.upload = function () {
        $('#uploadPhoto').click();
    };
    UserComponent.prototype.base64convert = function (pic) {
        var canvas = document.createElement('canvas');
        canvas.width = 80; // or 'width' if you want a special/scaled size
        canvas.height = 80; // or 'height' if you want a special/scaled size
        canvas.getContext('2d').drawImage(pic, 0, 0);
        return canvas.toDataURL();
    };
    UserComponent.prototype.uploadPhoto = function (event) {
        var _this = this;
        this.inputFile.nativeElement.click();
        var pic = document.getElementById('img');
        // $("#upload").replaceWith('<input type="file"  id="upload" class="upload " onchange="uploadData(this)" accept=".csv" style="display:none"  name="uploads[]">');
        var loadFile = function (event) {
            pic.setAttribute('src', URL.createObjectURL(event.target.files[0]));
        };
        loadFile(event);
        var inputFile = this.inputFile.nativeElement;
        var fileCount = inputFile.files.length;
        var formData = new FormData();
        if (fileCount > 0) {
            for (var i = 0; i < fileCount; i++) {
                formData.append('image', inputFile.files.item(i), inputFile.files.item(i).name);
            }
            this.http.post(this.url.apiUrl + '/user/photo/' + this.userID, formData)
                .subscribe(function (res) {
                _this.alert = true;
                var that = _this;
                setTimeout(function () {
                    that.alert = false;
                }, 5000);
            });
        }
    };
    UserComponent.prototype.saveChange = function () {
    };
    __decorate([
        core_2.ViewChild('inputFile'), 
        __metadata('design:type', core_2.ElementRef)
    ], UserComponent.prototype, "inputFile", void 0);
    UserComponent = __decorate([
        core_1.Component({
            selector: 'user-cmp',
            moduleId: module.id,
            templateUrl: 'user.component.html',
            styleUrls: ['../table.component.css']
        }), 
        __metadata('design:paramtypes', [router_1.Router, http_1.Http, app_config_1.AppConfig, core_2.ElementRef])
    ], UserComponent);
    return UserComponent;
}());
exports.UserComponent = UserComponent;
//# sourceMappingURL=user.component.js.map