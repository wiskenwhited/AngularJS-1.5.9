import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl,FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Http, Headers, Response } from '@angular/http';
import { Directive, forwardRef, Attribute } from '@angular/core';
import { AppConfig } from '../app.config';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/toPromise';
import { Injectable } from '@angular/core';

declare var $:any;

export class Signup {
    fullname: string;
    email: string;
    pass1: string;
    pass2: string;
    promo_code: string;
    userType: string;
}

export class Signin {
    smail: string;
    password: string;
    memo: boolean;
}

@Component({
    selector: 'login-cmp',
    templateUrl: './login.component.html',
    moduleId: module.id,
    styleUrls: ['./login.component.css']
})

export class LoginComponent {
    mode:boolean = false;
    selectedTab = 0;
    form: FormGroup;
    isValid:boolean = false;
    isValid1:boolean = false;
    signup: Signup = {
        fullname: '',
        email: '',
        pass1: '',
        pass2: '',
        promo_code: '',
        userType: ''
    }
    signin: Signin = {
        smail: '',
        password: '',
        memo: false
    }
    userTypes = [
        {value: '1', viewValue: 'Urgent'},
        {value: '2', viewValue: 'Normal'},
    ];

    checkConnect: any;
    result:boolean = false;
    fail:boolean = false;
    customMatch: boolean = false;
    wrongPass: boolean = false;
    emailConfirm:boolean = false;
    socialConfirm: boolean = false;
    param: any;

    constructor( private router: Router, private http: Http, private url: AppConfig, private location: Location){
       this.validate();
    }

    validate() {
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

        if (token && token!== undefined) that.param = token;
        if (_token && _token!== undefined) that.param = _token;
        if (that.param && that.param !== undefined && that.param !== null ) {
            this.http.get(this.url.apiUrl + '/user/verify/' +  that.param)
                .toPromise().then(   
                    (res) => {
                        if (res.text() !== 'ok')
                            localStorage.setItem('security', res.text());
                        this.redirect('dashboard');
                    });
                    
        } else  {
            var confirm = parseroute['account'];
            if (confirm && confirm !== undefined)
                this.emailConfirm = true;
                setTimeout(function() {
                    $('#signUptab').trigger('click');
                }, 500);
        }
    }

    isValidForm() {
        return this.isValid;
    }

    match() {

        if (this.signup.pass1 === this.signup.pass2){
            this.customMatch = false;
        }
        else  this.customMatch = true;
    }

    enroll(type) {
        var oAuthURL = this.url.apiUrl + '/auth/' + type;
        // window.location.href = oAuthURL;
        var win = window.open(oAuthURL, 'Authentication', 'left=650,top=250,width=500,height=500,modal=yes,alwaysRaised=yes');
        this.remove();
        var that = this;
        var checkConnect;
        window.addEventListener("message", function(event) {
            if (event.origin !== that.url.apiUrl) return;
            clearInterval(checkConnect);
            win = null;
            var response = event.data;
            if (response == 'success') {
                var token = localStorage.setItem("telecomUser", response);
                 that.http.get(that.url.apiUrl + '/user/gettoken')
                .toPromise().then(   
                        (res) => {
                                localStorage.setItem('security', res.text());
                                that.socialConfirm = false;
                                that.redirect('dashboard');
                        },
                        (err)=>console.log(err))
                    .catch(function(err) {
                        console.log("token error occured", err);
                    })
              
            } else if (response == 'failed' || response == undefined || response == null) {
                that.socialConfirm = true;
            }
        }, false);  

        win.postMessage("confirm", this.url.apiUrl);
        
        checkConnect = setInterval(function() {
            win.postMessage("confirm", that.url.apiUrl);
            if (!win || !win.closed) return;
            clearInterval(checkConnect);
        }, 1000);
    } 

    remove() {
        this.socialConfirm = false;
        this.isValid = false; 
        this.fail = false;
        this.result = false;
        this.wrongPass = false;
    }

    signIn(form) {
        this.remove();
        if (form.valid)
        for(var field in form.controls ) {
            const ctrl = form.controls[field];
            ctrl.markAsTouched();
        }
        else return;
        this.http.post(this.url.apiUrl + '/user/login', this.signin)
        .toPromise()
        .then(
            (response) => {
                var res = response.text();
                var arr = res.split(',');
                var token = arr[0];
                var userId = arr[1];
                localStorage.setItem("security", userId);
                localStorage.setItem("telecomUser", token);
                this.redirect('dashboard')},
            (fail) => {this.wrongPass = true;}
        );
    }

    signUp(form) {
        this.remove();
        if (form.valid && !this.customMatch)
            for(var field in form.controls ) {
                const ctrl = form.controls[field];
                ctrl.markAsTouched();
            }
            else return;

            this.isValid = true;
            this.http.post(this.url.apiUrl + '/user/create', this.signup)
                .toPromise().then(
                    (response) =>{
                        this.result = true;
                    },
                    (err)=> {
                        this.fail = true;
                        this.isValid = false;
                    });
    }

    redirect(redirectLink) {
        this.router.navigateByUrl(redirectLink);
    }
}
