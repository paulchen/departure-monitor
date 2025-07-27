import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Station, StationData} from '../main/station';
import {DataService} from '../data.service';
import { DecimalPipe, NgStyle, ViewportScroller } from '@angular/common';
import {SearchComponent} from '../search/search.component';
import {TableModule} from 'primeng/table';
import {ProgressSpinner} from 'primeng/progressspinner';

@Component({
  selector: 'app-vicinity',
  templateUrl: './vicinity.component.html',
  imports: [
    SearchComponent,
    TableModule,
    NgStyle,
    DecimalPipe,
    ProgressSpinner
],
  styleUrls: ['./vicinity.component.css']
})
export class VicinityComponent implements OnInit {
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

  private static rad2deg(rad) {
    return rad * 180 / Math.PI;
  }

  private static bearing(lat1, lon1, lat2, lon2) {
    // https://stackoverflow.com/questions/46590154/calculate-bearing-between-2-points-with-javascript
    let startLat = VicinityComponent.deg2rad(lat1);
    let startLng = VicinityComponent.deg2rad(lon1);
    let destLat = VicinityComponent.deg2rad(lat2);
    let destLng = VicinityComponent.deg2rad(lon2);

    let y = Math.sin(destLng - startLng) * Math.cos(destLat);
    let x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let bearing = VicinityComponent.rad2deg(Math.atan2(y, x));
    return (bearing + 360) % 360;
  }

  private static simpleBearing(lat1, lon1, lat2, lon2) {
    let bearing = this.bearing(lat1, lon1, lat2, lon2);

    // https://stackoverflow.com/questions/5619832/switch-on-ranges-of-integers-in-javascript
    switch (true) {
      case (bearing < 23): return 'N';
      case (bearing < 68): return 'NO';
      case (bearing < 113): return 'O';
      case (bearing < 158): return 'SO';
      case (bearing < 203): return 'S';
      case (bearing < 248): return 'SW';
      case (bearing < 293): return 'W';
      case (bearing < 338): return 'NW';
      default: return 'N';
    }
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
          speed: 0,
          toJSON(): string {
            return JSON.stringify(this)
          }
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

  findStations(coords: GeolocationCoordinates): { distance: number; station: Station }[] {
    return this
      .stationData
      .stations
      .map(item => {
        return {
          station: item,
          distance: VicinityComponent.calculateDistance(coords, item)
        };
      })
      .sort(this.compare)
      .slice(0, 10)
      .map(item => {
        return {
          station: item.station,
          distance: item.distance,
          direction: VicinityComponent.simpleBearing(coords.latitude, coords.longitude, item.station.lat, item.station.lon)
        };
      });
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
    this.router.navigate(['/station', event.id, event.name]).then(() => { /* empty */ });
  }
}
