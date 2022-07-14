import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MonitorComponent } from './monitor/monitor.component';
import { TableModule } from 'primeng/table';
import { MainComponent } from './main/main.component';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {InputSwitchModule} from 'primeng/inputswitch';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import {VicinityComponent} from './vicinity/vicinity.component';
import {SearchComponent} from './search/search.component';
import {CheckboxModule} from 'primeng/checkbox';
import {InplaceModule} from 'primeng/inplace';
import {TagModule} from 'primeng/tag';
import {MessagesModule} from 'primeng/messages';

@NgModule({
  declarations: [
    AppComponent,
    MonitorComponent,
    MainComponent,
    SearchComponent,
    VicinityComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TableModule,
    AutoCompleteModule,
    BrowserAnimationsModule,
    FormsModule,
    ButtonModule,
    ProgressSpinnerModule,
    InputSwitchModule,
    CheckboxModule,
    InplaceModule,
    TagModule,
    MessagesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
