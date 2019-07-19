import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { FormsModule } from '@angular/forms'; 
import { BrowserModule } from '@angular/platform-browser';
@NgModule({
    imports: [ RouterModule, CommonModule, FormsModule, BrowserModule ],
    declarations: [ NavbarComponent ],
    exports: [ NavbarComponent ]
})

export class NavbarModule {}
