import { Component, OnInit, trigger, state, style, transition, animate } from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef, Injectable, Input } from '@angular/core';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { AppConfig } from '../../app.config';

export class UserProfile {
    company: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    country: string;
    postal_code: string;
    overview: string;
    password: string;
    confirm_password: string;
}

@Component({
    selector: 'user-cmp',
    moduleId: module.id,
    templateUrl: 'user.component.html',
    styleUrls: ['../table.component.css']
})

export class UserComponent implements OnInit{
    @ViewChild('inputFile') inputFile : ElementRef;
    profile: any = {};
    username: string;
    photo: string;
    alert: boolean = false;
    user: UserProfile = {
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
    }

    userID = localStorage.getItem('security');
    constructor(private route: Router, private http: Http, private url: AppConfig, private e1: ElementRef) {
    }
    ngOnInit(){
        this.http.get(this.url.apiUrl + '/user/getProfile/' + this.userID)
            .subscribe(
                res => {
                    this.profile = res.json();
                    this.username = this.profile[0].name;

                    this.photo = this.profile[0].photo;
                    if (!this.photo) {
                        this.photo = '/assets/img/faces/photo.jpg';
                    }
                },
                err => {
                    console.log(err);   
                }
            )
    }

    save() {
        console.log(this.user);
        this.http.post(this.url.apiUrl + '/user/setProfile/' + this.userID, this.user)
            .subscribe(
                res => {
                    console.log("saved successfully");
                }
            );
    }

    upload() {
        $('#uploadPhoto').click();
    }

    base64convert(pic){
        var canvas = document.createElement('canvas');
        canvas.width = 80; // or 'width' if you want a special/scaled size
        canvas.height = 80; // or 'height' if you want a special/scaled size
        canvas.getContext('2d').drawImage(pic, 0, 0);
        return canvas.toDataURL();
    }
    uploadPhoto(event) {
        this.inputFile.nativeElement.click();
        var pic = document.getElementById('img');
        // $("#upload").replaceWith('<input type="file"  id="upload" class="upload " onchange="uploadData(this)" accept=".csv" style="display:none"  name="uploads[]">');
        var loadFile = function(event) {
            pic.setAttribute('src', URL.createObjectURL( event.target.files[ 0 ]));
        };
        loadFile(event);
            let inputFile: HTMLInputElement = this.inputFile.nativeElement;
            let fileCount: number = inputFile.files.length;
            let formData = new FormData();
            
            if ( fileCount > 0 ) {
                for (let i = 0; i < fileCount; i++) {
                        formData.append('image', inputFile.files.item(i), inputFile.files.item(i).name);
                }
                this.http.post(this.url.apiUrl + '/user/photo/' + this.userID, formData )
                .subscribe(
                    res => {
                        this.alert = true;
                        var that = this;
                        setTimeout(function() {
                            that.alert = false;
                        }, 5000);
                    }
                )
            }
    }
    saveChange() {

    }
}
