import {Component, OnInit} from '@angular/core';
import { Router} from '@angular/router';
import {Station, StationData} from "../main/station";
import {DataService} from "../data.service";

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

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    this.dataService.getStations().subscribe(stationData => {
      this.stationData = stationData;
      this.loading = false;
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
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
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
}
