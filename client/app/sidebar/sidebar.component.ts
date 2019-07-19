import { Component, OnInit } from '@angular/core';
import { ROUTES } from './sidebar-routes.config';
import { Http, Headers, Response } from '@angular/http';
import { AppConfig } from '../app.config';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/toPromise';
declare var $:any;

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    username: string = '';
    email: string = '';
    photourl: string='';
    public menuItems: any[];
    constructor(private http: Http, private url: AppConfig) {
    }

    ngOnInit() {
        $.getScript('../../assets/js/sidebar-moving-tab.js');
        this.menuItems = ROUTES.filter(menuItem => menuItem);
        this.profile();
        // setInterval(function() {
        //     this.profile()
        // }, 15000);
    }

    profile() {
        var userID = localStorage.getItem('security');
        this.http.get(this.url.apiUrl + '/user/getProfile/' + userID)
            .toPromise()
            .then(
                res => {
                    var user = res.json()[0].name;
                    var email = res.json()[0].email;
                    this.photourl = res.json()[0].photo;
                    if (user)
                        this.username = user;
                    if (email)
                        this.email = email;
                }
            )
            .catch(err => console.log(err));
    }

    get() {
        if (!this.photourl) {
            this.photourl = '/assets/img/faces/photo.jpg';
        }
        return this.photourl;
    }
}
