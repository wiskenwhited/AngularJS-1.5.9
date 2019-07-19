"use strict";
var dashboard_component_1 = require('./dashboard.component');
var home_component_1 = require('./home/home.component');
var user_component_1 = require('./user/user.component');
var table_component_1 = require('./table/table.component');
var login_component_1 = require('../login/login.component');
exports.MODULE_ROUTES = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: login_component_1.LoginComponent },
    { path: 'test', component: dashboard_component_1.DashboardComponent },
    { path: 'dashboard', component: dashboard_component_1.DashboardComponent, children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: home_component_1.HomeComponent },
            { path: 'user', component: user_component_1.UserComponent },
            { path: 'table', component: table_component_1.TableComponent },
        ] }
];
exports.MODULE_COMPONENTS = [
    home_component_1.HomeComponent,
    user_component_1.UserComponent,
    table_component_1.TableComponent,
    login_component_1.LoginComponent,
];
//# sourceMappingURL=dashboard.routes.js.map