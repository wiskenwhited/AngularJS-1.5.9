import { Component, OnInit, trigger, state, style, transition, animate } from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef, Injectable, Input } from '@angular/core';
import { AppConfig } from '../../app.config';

import {Observable} from 'rxjs/Rx';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

declare global {
    interface Window { 
        price: number;
        paymentSuccess: string;
        balance: string;
        payerID: string;
        paymentID: string;
        paymentToken: string;
        csvFileName: string;
        uploadFile: any;
        realFilename: string;
        jobID: number;
    }
}

@Injectable()
export class Siftjob {
    filename: string;
    dnc: string;
    gold: string;
    total: string;
    progress: number;
    cost_matches: string;
    cost_dips: string;
    total_cost: string;
    realFilename: string;
    created_date: string;
    status: string;
    download_status: boolean;
    payment_status: boolean;
}

@Component({
    selector: 'home-cmp',
    styleUrls:['../table.component.css', './home.component.css'],
    moduleId: module.id,
    templateUrl: 'home.component.html'
})                      

export class HomeComponent implements OnInit {
    @ViewChild('upload-btn') uploadbtn;
    @ViewChild('inputFile') inputFile : ElementRef;
    pages : number = 3;
    pageSize : number = 10;
    pageNumber : number = 3;
    currentIndex : number = 1;
    memoIndex: number = 1;
    pagesIndex : Array<number>;
    pageStart : number = 1;
    rowPerPage = [ 5, 10, 15, 20, 25 ];
    jobList : Siftjob[];
    taskList : Siftjob[] = [];
    activeList : Siftjob[] = [];
    completedList : Siftjob[] = [];
    filteredJobList : Siftjob[];
    pagination : Siftjob[];
    
    jobID: any;
    delJobID: any;
    sort: string = 'All';

    response: string;
    uploadScan: any;
   
    location: Location;
    uploadMode: boolean = true;
    activeMode: boolean = true;
    csvUrl: string = '';  // URL to web API
    csvData: any[] = [];
    price: number = 1000;
    balance: any = '0';
    userID: string = localStorage.getItem('security');
    scan: any;
    searchResult: any[] = [];

    index: number;
    checkbox: boolean[] = [false];
    count: number = 0;
    downloadlink: string;

    constructor(private route: Router, private http: Http, private url: AppConfig, private e1: ElementRef) {
        var that = this;
        setInterval(function() {
            that.getAll();
        }, 3000);
    }

    ngOnInit() {
        this.getAll();
    }

    // Cancel  Job process
    abc(index) {
        var jobID = this.filteredJobList[index]['id'];
        this.delJobID =jobID;
        $('#cancelled').click();
    }

    changeState(type) {
        this.sort = type;
        this.actvieJob();
    }

    lid() {
        this.http.get(this.url.apiUrl + '/dnc/delete/' + this.delJobID)
        .toPromise()
        .then(
            res => {
                $('#jobcancel').hide();
            }
        )
        .catch(err => console.log(err));
    }

    getAll() {
        this.memoIndex = this.currentIndex;
        if (this.activeList.length > 0 ) this.activeList = [];
        if (this.taskList.length > 0 ) this.taskList = [];
        this.http.get(this.url.apiUrl + '/dnc/getAll/' + this.userID)
            .subscribe(
                res =>  {
                    this.filteredJobList = this.pagination = this.jobList = res.json() as Siftjob[]; // fetch the dnc data from server
                     if (this.activeList.length > 0 ) this.activeList = [];
                    if (this.taskList.length > 0 ) this.taskList = [];
                    this.jobList.forEach(val => {
                        if(val['payment_status'] == false) {
                            this.taskList.push(val);
                        } else {
                            this.activeList.push(val);
                        }
                    });
                    this.actvieJob();
                }
            );
    }

    // Detect inactive job list from the db
    dncCheck() {
        // Progress the dnc job
        if (this.taskList && this.taskList.length > 0) {
            var val = this.taskList.pop();
            if (val['status'] == 'stopped') {
                this.http.get(this.url.apiUrl + '/dnc/process/' + this.userID +'/' + val['real_filename'])
                    .toPromise()
                    .then((res) =>  console.log('ok'));
            }
        } 
    }

    pay(index) {
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
    }

    // Upload the csv file
    spec() {
        this.uploadMode = false;
        if (!this.uploadMode) {
            $('.dropZoneArea, .dropZone1').css({'display':'block'});
            var that = this;
            this.uploadScan = setInterval(function() {   
                that.detectChange();
                if (that.uploadMode) {
                    clearInterval(that.uploadScan);
                    $('.dropZoneArea, .dropZone1').css({'display':'none'});
                }
            }, 1000);
        } 
    }

    // Active/Inactive job
    actvieJob() {
       
        
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
    }

    getItems() {
        this.count = 0;
        this.checkbox.forEach(val => {
            if (val ) {
                 this.count++;
            }
        });
    }

    // Download the dnc job
    download(type, index) {
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
            .then(
                res => {
                    this.downloadlink = this.url.apiUrl + res.text();
                    $("#download").attr("href", this.downloadlink);
                    if (res.text() && res.text() != null && this.downloadlink !== null) {
                        document.getElementById('download').click();
                    }
                }
            )
            .catch(
                err => {
                    $('#down-alert').click();
                }
            )
        // });
     
    }

    keep() {
        this.pages = 4;
        this.pageNumber = parseInt(""+ (this.pagination.length / this.pageSize));
        if(this.pagination.length % this.pageSize != 0){
            this.pageNumber ++;
        }
        if(this.pageNumber  < this.pages) {
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
            filedata => {this.pagination=this.filteredJobList = this.jobList = filedata.json() as Siftjob[];
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
            brand =>  ( brand.filename.toLowerCase().indexOf(filterKey) != -1 )
        );
        this.searchResult = this.filteredJobList;
        this.init();
    }

    uploadData(event) {

        let inputFile: HTMLInputElement = this.inputFile.nativeElement;
        let fileCount: number = inputFile.files.length;
        let formData = new FormData();
        let filename = inputFile.files[0].name;
        this.csvUrl = URL.createObjectURL( event.target.files[ 0 ]);
        this.detectChange();
    }

    readCsvData () {
        let dropUrl = $('.urlValue').val();
        let url;
        if (dropUrl) url = dropUrl;
            else url = this.csvUrl;
      
        if (url)  this.http.get(url)
            .subscribe(
                data => this.extractData(data),
                err => this.handleError(err)
            );
    }

    private extractData(res: Response) {

        let csvData = res['_body'] || '';
        let allTextLines = csvData.split(/\r\n|\n/);
        let headers = allTextLines[0].split(',');
        let lines = [];

        for ( let i = 0; i < allTextLines.length; i++) {
            // split content based on comma
            let data = allTextLines[i].split(',');
            if (data.length == headers.length) {
                let tarr = [];
                for ( let j = 0; j < headers.length; j++) {
                    tarr.push(data[j]);
                }
                lines.push(tarr);
            }
        }
    }
   
    detectChange() {
        var files =  window.uploadFile;
        if (!files) {
            return;
        }
        window.uploadFile = null;
        this.uploadMode = true;

        var fileCount;
        if (files) {
            fileCount = files.length;
        } else {
            fileCount = 0;
        }
            
        let formData = new FormData();
        let headers = new Headers();

        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');

        let options = new RequestOptions({ headers: headers });
        
        if ( fileCount > 0 ) {
            for (let i = 0; i < fileCount; i++) {
                    formData.append('uploads', files.item(i), files.item(i).name);
            }
            this.http.post(this.url.apiUrl + '/dnc/uploadcsv/' + window.csvFileName + '/' + this.userID + '/' + window.balance, formData )
            .subscribe(
                res => {
                    this.ngOnInit();
                }
            )
        }
    }

    private handleError (error: any) {
        let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return errMsg;
    }

}
