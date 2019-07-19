import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';

import { AppComponent }   from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule} from './shared/navbar/navbar.module';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { HomeComponent } from './dashboard/home/home.component';
import { UserComponent } from './dashboard/user/user.component';
import { TableComponent } from './dashboard/table/table.component';
import { LoginComponent } from './login/login.component';


import { Route } from './app.routes';
import { AppConfig } from './app.config';
@NgModule({
    imports:      [
        BrowserModule,
        HttpModule,
        CommonModule,
        FormsModule,
        DashboardModule,
        SidebarModule,
        NavbarModule,
        Route
    ],
    declarations: [ AppComponent,  DashboardComponent ],
    providers: [{provide: LocationStrategy,  useClass: HashLocationStrategy}, AppConfig],
    bootstrap:    [ AppComponent ]
})
export class AppModule {}
