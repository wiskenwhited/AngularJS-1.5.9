import { Component, OnInit, trigger, state, style, transition, animate } from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Http, Headers, Response } from '@angular/http';
import { AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef, Injectable, Input } from '@angular/core';
import { AppConfig } from '../../app.config';

import {Observable} from 'rxjs/Rx';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ChargeHistory {
    payment_amount: string;
    prev_balance: string;
    job_name: string;
    new_balance: string;
    date: string;
}

@Component({
    selector: 'table-cmp',
    moduleId: module.id,
    templateUrl: 'table.component.html',
    styleUrls:['../table.component.css']
})


export class TableComponent{

    pages : number = 3;
    pageSize : number = 10;
    pageNumber : number = 3;
    currentIndex : number = 1;
    pagesIndex : Array<number>;
    pageStart : number = 1;
    rowPerPage = [ 1, 10, 15, 20, 25 ];
    jobList : ChargeHistory[];
    filteredJobList : ChargeHistory[];
    pagination : ChargeHistory[];
    userID: string = localStorage.getItem('security');

    response: string;
    constructor(private route: Router, private http: Http, private url: AppConfig){
         this.http.get(this.url.apiUrl + '/paypal/getChargeHistory/' + this.userID)
            .subscribe(
                res =>  {
                    this.filteredJobList = this.pagination = this.jobList = res.json() as ChargeHistory[]; // fetch the dnc data from server
                    this.init(); // table init
                },
                err => console.log("No recharge history")
            );
        
    }

     keep() {
        this.pages = 4;
        this.pageNumber = parseInt(""+ (this.pagination.length / this.pageSize));
        if(this.pagination.length % this.pageSize != 0){
            this.pageNumber ++;
        }
        if(this.pageNumber  < this.pages){
            this.pages =  this.pageNumber;
        }
    }

    init() {
        this.currentIndex = 1;
        this.pageStart = 1;
        this.pages = 4;
        this.pageNumber = parseInt(""+ (this.pagination.length / this.pageSize));
        if(this.pagination.length % this.pageSize != 0){
            this.pageNumber ++;
        }
        if(this.pageNumber  < this.pages){
            this.pages =  this.pageNumber;
        }
        this.refreshItems();
    }

    change(value) {
        this.pageSize = value;
        this.currentIndex = 1;
        this.pageStart = 1;
        this.pages = 4;
        this.pageNumber = parseInt(""+ (this.pagination.length / this.pageSize));
        if(this.pagination.length % this.pageSize != 0){
            this.pageNumber ++;
        }
        if(this.pageNumber  < this.pages){
            this.pages =  this.pageNumber;
        }
        this.refreshItems();
    }

    fillArray(): any {
        var obj = new Array();
        for(var index = this.pageStart; index< this.pageStart + this.pages; index ++) {
            obj.push(index);
        }
        return obj;
    }
 
    refreshItems() {
        this.filteredJobList = this.pagination.slice((this.currentIndex - 1)*this.pageSize, (this.currentIndex) * this.pageSize);
        this.pagesIndex =  this.fillArray();
    }

    prevPage() {
        if(this.currentIndex>1){
            this.currentIndex --;
        } 
        if(this.currentIndex < this.pageStart){
            this.pageStart = this.currentIndex;
        }
        this.refreshItems();
    }

    nextPage() {
        if(this.currentIndex < this.pageNumber){
            this.currentIndex ++;
        }
        if(this.currentIndex >= (this.pageStart + this.pages)){
            this.pageStart = this.currentIndex - this.pages + 1;
        } 
        this.refreshItems();
    }
    setPage(index : number) {
        this.currentIndex = index;
        this.refreshItems();
    }

    private update(): void {
        this.http.get(this.url.apiUrl).subscribe(
            filedata => {this.pagination=this.filteredJobList = this.jobList = filedata.json() as ChargeHistory[];
                this.init();
            },
            error => this.jobList =error.text()
        );
    };



    
    // Search bar process
    filter(filterKey) {  
        filterKey = filterKey.toLowerCase();
        if (filterKey === "") {
            this.pagination = this.jobList;
            this.init();
            return;
        }
        this.pagination = this.filteredJobList = this.jobList.filter(
            brand =>  ( brand.date.toLowerCase().indexOf(filterKey) != -1 )
        );
        this.init();
    }

     private handleError (error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return errMsg;
    }



}
