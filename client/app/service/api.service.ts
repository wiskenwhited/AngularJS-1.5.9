import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { AppConfig } from '../app.config';

@Injectable()
export class ApiService {
    public token: string;
    private endpoint: string;

    constructor(private http: Http, private config: AppConfig) {
        this.endpoint = this.config.apiUrl;
    }

    private process(response:Response) {
        let json = response.json();
        if (json && json.errorMessage) {
            throw new Error(json.errorMessage);
        }
        return json;
    }

    private processError(error: any) {
        let errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }


    getHeaders() {
        let headers = new Headers();
        if(this.getToken()) {
            headers.append('Authorization', this.getToken());
        }
        return {
            headers: headers
        };
    }

    get(url) {
        // return this
        //     .http
        //     .get(url, this.getHeaders())
        //     .map(this.process)
        //     .catch(this.processError);
        return Observable.fromPromise(Promise.resolve({}));
    }

    post(url, data) {
        /*return Observable.fromPromise(Promise.resolve('token'));*/
        return this
            .http
            .post(url, data, this.getHeaders())
            .map(this.process);
    }

    put(url, data) {
        return this
            .http
            .put(url, data, this.getHeaders())
            .map(this.process)
            .catch(this.processError);

    }

    delete(url) {
        return this
            .http
            .delete( url, this.getHeaders())
            .map(this.process)
            .catch(this.processError);
    }

    getToken() {
        return localStorage.getItem('this.config.jwtKey');
    }

    setToken(token) {
        localStorage.setItem('this.config.jwtKey', token.token);
    }

    deleteToken() {
        localStorage.removeItem('this.config.jwtKey');
    }
}