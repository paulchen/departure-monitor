import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Station, StationData} from '../main/station';
import {DataService} from '../data.service';
import {ViewportScroller} from '@angular/common';

@Component({
  selector: 'app-vicinity',
  templateUrl: './vicinity.component.html',
  styleUrls: ['./vicinity.component.css']
})
export class VicinityComponent implements OnInit {
  selectedStation: Station;
  results: Station[] = [];
  private stationData: StationData = new StationData();
  loading = true;
  loadingLocation = false;
  locationError = false;
  nearStations: { distance: number; station: Station }[];

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private viewportScroller: ViewportScroller,
  ) { }

  private static calculateDistance(coords: GeolocationCoordinates, station: Station) {
    return VicinityComponent.getDistanceFromLatLonInKm(coords.latitude, coords.longitude, station.lat, station.lon);
  }

  private static getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = VicinityComponent.deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = VicinityComponent.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(VicinityComponent.deg2rad(lat1)) * Math.cos(VicinityComponent.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private static deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  ngOnInit(): void {
    const component = this;
    this.dataService.getStations().subscribe(stationData => {
      this.stationData = stationData;
      this.loading = false;

      this.route.params.subscribe(params => {
        const coords: GeolocationCoordinates = {
          latitude: parseFloat(params.lat),
          longitude: parseFloat(params.lon),
          accuracy: 0,
          altitude: 0,
          altitudeAccuracy: 0,
          heading: 0,
          speed: 0
        }
        this.nearStations = this.findStations(coords);

        setTimeout(() => { component.scrollToMessage() }, 100);
      })
    });
  }

  private scrollToMessage() {
    this.viewportScroller.scrollToAnchor('nearby_stations');
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
      this.nearStations = this.findStations(position.coords);
    }, () => {
      this.loadingLocation = false;
      this.nearStations = [];
      this.locationError = true;
    }, {
      timeout: 10000,
      maximumAge: 0
    });
  }

  findStations(coords: GeolocationCoordinates): { distance: number; station: Station }[] {
    return this.stationData.stations.map(item => {
      return {station: item, distance: VicinityComponent.calculateDistance(coords, item)};
    }).sort(this.compare).slice(0, 10);
  }

  compare(a, b) {
    if (a.distance < b.distance) {
      return -1;
    }
    if (a.distance > b.distance) {
      return 1;
    }
    return 0;
  }

  selectStation(event: Station) {
    this.router.navigate(['/station', event.id, event.name]).then(() => {});
  }
}
