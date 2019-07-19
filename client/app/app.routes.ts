import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ModuleWithProviders } from '@angular/core';
import { HomeComponent } from './dashboard/home/home.component';
import { UserComponent } from './dashboard/user/user.component';
import { TableComponent } from './dashboard/table/table.component';

export const MODULE_ROUTES: Routes =[
    // { path: '', redirectTo: 'login/:id', pathMatch: 'full' },
    // { path: 'login/:id', component: LoginComponent }
    // { path: 'dashboard', loadChildren: './app/dashboard/dashboard.module#DashboardModule'},
    // { path: 'dashboard', component: DashboardComponent, children:[
        // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        // { path: 'dashboard', component: HomeComponent},
    //     { path: 'table', component: TableComponent},
    //     { path: 'user', component: UserComponent},
    // ]}

]

export const Route: ModuleWithProviders = RouterModule.forRoot(MODULE_ROUTES, { useHash: false });

