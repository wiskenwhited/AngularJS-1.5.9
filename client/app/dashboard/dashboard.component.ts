import { Component } from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

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

@Component({
    selector: 'dashboard-cmp',
    moduleId: module.id,
    templateUrl: 'dashboard.component.html'
})

export class DashboardComponent{
      constructor(private route: Router) {
        var token = localStorage.getItem('mailC');
        if (!token) token =localStorage.getItem('telecomUser');
        if (!token || token == null) 
            this.route.navigateByUrl('login');
    }
}
