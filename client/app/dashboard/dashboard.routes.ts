import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { TableComponent } from './table/table.component';
import { LoginComponent } from '../login/login.component';
export const MODULE_ROUTES: Route[] =[
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path:'login', component: LoginComponent },
    { path : 'test', component: DashboardComponent},
    { path:'dashboard', component: DashboardComponent ,  children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        { path: 'dashboard', component: HomeComponent }, 
        { path: 'user', component: UserComponent },
        { path: 'table', component: TableComponent },
  
    ]}
]

export const MODULE_COMPONENTS = [
    HomeComponent,
    UserComponent,
    TableComponent,
    LoginComponent,

]
