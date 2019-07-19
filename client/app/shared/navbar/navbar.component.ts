import { Component, OnInit, Input } from '@angular/core';
import { ROUTES } from '../.././sidebar/sidebar-routes.config';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ElementRef, ViewChild, Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { FormBuilder, FormControl,FormGroup, Validators } from '@angular/forms';
import { AppConfig } from '../../app.config';

declare global {
    interface Window { 
        renderPaypal: any;
        price: number;
        paymentSuccess: string;
        balance: string;
        payerID: string;
        paymentID: string;  
        paymentToken: string;
        csvFileName: string;
        jobID: number;
    }
}

@Component({
    moduleId: module.id,
    selector: 'navbar-cmp',
    templateUrl: 'navbar.component.html',
    styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {

    private listTitles: any[];
    @ViewChild('upload-btn') uploadbtn;
    @ViewChild('inputFile') inputFile : ElementRef;
    location: Location;
    uploadMode:boolean = false;
    csvUrl: string = '';  // URL to web API
    csvData: any[] = [];
    price: number = 1000;
    balance: any = 0;
    userID: string = localStorage.getItem('security');
    scan: any;
    navStatus: boolean = false;
    
    constructor(location: Location, private e1: ElementRef, private http: Http, private route: Router, private url: AppConfig) {
        this.location = location;
        this.price = 0; // initial price
        this.payment();
    }

    ngOnInit() {
        this.listTitles = ROUTES.filter(listTitle => listTitle);
        window.renderPaypal();
    }

    getBalance() {
        this.http.get(this.url.apiUrl + '/paypal/balance/' + this.userID)
            .toPromise()
            .then(
                res => {
                    var balance = res.json().balance;
                    if (isNaN(balance) || parseFloat(balance) <= 0) {
                        // $('.balance-alert').click();
                    } else {
                        $('#balanceAlert').hide();
                        this.balance = res.json().balance;
                    }
                }
            )
            .catch(function(err){
                this.handleError(err);
            });
    }

    payment() {
        // console.log(this.price + "payment function");
        this.price = parseFloat($('.cost').text());
        if (this.price == undefined || this.price == null || this.price<0) return;
        window.price = this.price;

        var that = this;
        this.scan = setInterval(function() {
            
            var paymentEvent = window.paymentSuccess;
            if (paymentEvent == 'paid') {
                that.balance =  Number.parseFloat(that.balance) + window.price;
                $('#myModal').hide();
                clearInterval(that.scan);
                paymentEvent = null;
                window.paymentSuccess = null;
                
                that.emailConfirm();
                that.switchJobStatus();
                that.rechargeHistory();
            } 
        }, 1000);
        
    }

    saveBalance() {
        var body = {
            userID: this.userID,
            balance: this.balance
        }
        console.log("saveBalance", body);
        this.http.post(this.url.apiUrl + '/paypal/balance', body)
            .toPromise()
            .then( res => this.balance = res.text())
            .catch(error => this.handleError(error));
    }

    emailConfirm() {
        this.http.get(this.url.apiUrl + '/paypal/emailConfirm/' + this.userID)
            .toPromise()
            .then(
                res => console.log(res)
            )
            .catch(err => console.log(err))
    }

    rechargeHistory() {
        var body = {
            confirmation_id: window.paymentID,
            payment_amount: window.price,
            prev_balance:  window.price,
            new_balance: window.price,
            user_id: window.payerID,
            job_name: window.jobID
        };
        console.log(body);
        this.http.post(this.url.apiUrl + '/paypal/history/' + this.userID , body)
            .toPromise()
            .then(
                res => console.log(res)
            )
            .catch(err => this.handleError(err));
    }

    switchJobStatus() {
        this.http.get(this.url.apiUrl + '/dnc/setStatus/' + window.jobID)
            .toPromise()
            .then(
                res => {
                    console.log("setstatus changed paid");
                }
            );
    }

    private handleError (error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return errMsg;
    }

    logout() {
        localStorage.removeItem('telecomUser');
        localStorage.removeItem('mailC');
        localStorage.removeItem('security');
        localStorage.removeItem('user');
        this.route.navigateByUrl('login');
    }

    navBar() {
        this.navStatus = !this.navStatus;
        if (this.navStatus) {
            $('.sidebar').css({'display':'none'});
            $('.main-panel').css({'width':'100%'});
        } else {
            $('.sidebar').css({'display':'block'});
            $('.main-panel').attr('style', '');
        }
    }

    getTitle() {

        var titlee = this.location.prepareExternalUrl(this.location.path());
        if(titlee.charAt(0) === '#'){
            titlee = titlee.slice( 12 );
        }
        for(var item = 0; item < this.listTitles.length; item++){
            if(this.listTitles[item].path === titlee){
                return this.listTitles[item].title;
            }
        }
        return 'Dashboard';
    }
}
