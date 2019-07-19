import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { MODULE_COMPONENTS, MODULE_ROUTES } from './dashboard.routes';
import { SidebarModule } from '../sidebar/sidebar.module';
import { FooterModule } from '../shared/footer/footer.module';
import { NavbarModule} from '../shared/navbar/navbar.module';


@NgModule({
    imports: [
        RouterModule.forChild(MODULE_ROUTES),
        SidebarModule,
        NavbarModule,
        BrowserModule,
        FormsModule
    ],
    declarations: [ MODULE_COMPONENTS  ]
})

export class DashboardModule{}
