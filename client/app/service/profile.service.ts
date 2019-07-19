import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs/Observable';
import { Observer }  from 'rxjs/Observer';
import { Response } from '@angular/http';
import { AppConfig } from '../app.config';

@Injectable()
export class ProfileService {
    public profile;
    public token : any[] = [];
    loggedIn: boolean;
    status: Observable<boolean>;
    private observer: Observer<boolean>;

    constructor(private api:ApiService, private url: AppConfig) {
        this.status = new Observable<boolean>(observer =>
            this.observer = observer
        );
    }

    changeState(newState:boolean) {
        if(this.observer !== undefined) this.observer.next(newState);
    }

    isLoggedIn() {
        let token = this.api.getToken();
        if(!token) {
            this.changeState(false);
            return Observable.fromPromise(Promise.resolve(false));
        }
        return this
            .api // <- you can amend that for you API
            .get('profile/me')
            .map(response => {
            this.profile = response;
            this.loggedIn = true;
            this.changeState(true);
            return true;
        });
    }

    login(username, password): Observable<boolean> {
        return this.api 
            .post(this.url.apiUrl + '/managers/authenticate', {
                username: username,
                password: password
            })
            .flatMap(data => {
                this.api.setToken(data);
                return this.isLoggedIn();
            });
    }

    logout(): void {
        this.api.deleteToken();
        this.loggedIn = false;
        this.changeState(false);
    }
}