import {Component, OnInit} from '@angular/core';
import { Router} from '@angular/router';
import {Station, StationData} from '../main/station';
import {DataService} from '../data.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
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

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    if (localStorage.getItem(environment.localStoragePrefix + 'save_history') === 'true') {
      this.saveHistory = true;
    }

    this.dataService.getStations().subscribe(stationData => {
      this.stationData = stationData;
      this.loading = false;

      if (this.saveHistory) {
        const stationHistory = localStorage.getItem(environment.localStoragePrefix + 'station_history');
        if (stationHistory !== null) {
          this.mostRecentStations = stationHistory
            .split(',')
            .map(id => {
              return this.stationData.stations.find(station => station.id.toString() === id);
            });
        }
      }
    });
  }

  search(event: any) {
    this.results = this.stationData.stations
      .filter(station => station.name.toLowerCase().indexOf(event.query.toLowerCase()) !== -1)
      .sort((a, b) => b.line_count - a.line_count);
  }

  useGeolocation() {
    this.loadingLocation = true;
    this.locationError = false;
    navigator.geolocation.getCurrentPosition(position => {
      this.loadingLocation = false;
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      this.router.navigate(['/vicinity', lat, lon]).then(() => {});
    }, () => {
      this.loadingLocation = false;
      this.locationError = true;
    }, {
      timeout: 10000,
      maximumAge: 0
    });
  }

  selectStation(event: Station) {
    this.router.navigate(['/station', event.id, event.name]).then(() => {});
  }

  updateHistorySetting(event) {
    if (event.checked) {
      localStorage.setItem(environment.localStoragePrefix + 'save_history', 'true')
    }
    else {
      localStorage.removeItem(environment.localStoragePrefix + 'save_history');
      localStorage.removeItem(environment.localStoragePrefix + 'station_history');
      this.mostRecentStations = [];
    }
  }
}
