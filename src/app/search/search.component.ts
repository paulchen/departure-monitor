import {Component, OnInit} from '@angular/core';
import { Router} from '@angular/router';
import {Station, StationData} from '../main/station';
import {DataService} from '../data.service';
import {environment} from '../../environments/environment';
import {LocalStorageService} from "../local-storage.service";
import {AutoComplete} from 'primeng/autocomplete';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {Checkbox} from 'primeng/checkbox';
import {ProgressSpinner} from 'primeng/progressspinner';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  imports: [
    AutoComplete,
    NgIf,
    FormsModule,
    Button,
    Checkbox,
    NgForOf,
    NgStyle,
    ProgressSpinner
  ],
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  selectedStation: Station;
  results: Station[] = [];
  private stationData: StationData = new StationData();
  loading = true;
  loadingLocation = false;
  locationError = false;
  mostRecentStations: Station[] = [];
  saveHistory = false;

  constructor(private dataService: DataService, private router: Router, private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.saveHistory = this.localStorageService.isHistoryEnabled();

    this.dataService.getStations().subscribe(stationData => {
      this.stationData = stationData;
      this.loading = false;
      this.mostRecentStations = this.localStorageService.getHistory(stationData);
    });
  }

  search(event: any) {
    let input = event.query.toLowerCase();
    this.results = this.stationData.stations
      .filter(station => station.name.toLowerCase().indexOf(input) !== -1)
      .sort(function(a, b) {
        let line_difference = b.line_count - a.line_count;
        if (line_difference != 0) {
          return line_difference;
        }

        let startsWithInputA = a.name.toLowerCase().startsWith(input);
        let startsWithInputB = b.name.toLowerCase().startsWith(input);

        if (startsWithInputA && !startsWithInputB) {
          return -1;
        }

        if (!startsWithInputA && startsWithInputB) {
          return 1;
        }

        return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      });
  }

  useGeolocation(reload: boolean = false, router: Router = this.router) {
    this.loadingLocation = true;
    this.locationError = false;
    navigator.geolocation.getCurrentPosition(position => { //NOSONAR
      if(!reload) {
        window.setTimeout(this.useGeolocation, 1000, true, this.router);
      }
      else {
        this.loadingLocation = false;
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        router.navigate(['/vicinity', lat, lon]).then(() => { /* do nothing */ });
      }
    }, () => {
      this.loadingLocation = false;
      this.locationError = true;
    }, {
      timeout: 10000,
      maximumAge: 0
    });
  }

  selectStation(event: Station) {
    this.router.navigate(['/station', event.id, event.name]).then(() => { /* empty */ });
  }

  updateHistorySetting(event) {
    if (event.checked) {
      this.localStorageService.enableHistory();
    }
    else {
      this.localStorageService.disableHistory();
      this.mostRecentStations = [];
    }
  }
}
