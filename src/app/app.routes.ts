import { Routes } from '@angular/router';
import {MainComponent} from './main/main.component';
import {MonitorComponent} from './monitor/monitor.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {VicinityComponent} from "./vicinity/vicinity.component";


export const routes: Routes = [
  {path: '', component: MainComponent, data: {routeName: 'Search'}},
  {path: 'vicinity/:lat/:lon', component: VicinityComponent, data: {routeName: 'Vicinity'}},
  {path: 'station/:id/:name', component: MonitorComponent, data: {routeName: 'Station'}},
  {path: '**', component: PageNotFoundComponent},
];
