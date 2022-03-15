import { Component } from '@angular/core';
import {Station} from './main/station';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'departure-monitor';

  station: Station;

  stationSelected(station: Station) {
    this.station = station;
  }

  doReset() {
    this.station = null;
  }
}
