import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {RblService} from '../rbl.service';
import {Station} from './station';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  @Output() selected = new EventEmitter<Station>();

  selectedStation: Station;
  results: Station[] = [];
  private stations: Station[] = [];
  nearStations: { distance: number; station: Station }[];

  private static calculateDistance(coords: Coordinates, station: Station) {
    return SearchComponent.getDistanceFromLatLonInKm(coords.latitude, coords.longitude, station.lat, station.lon);
  }

  private static getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = SearchComponent.deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = SearchComponent.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(SearchComponent.deg2rad(lat1)) * Math.cos(SearchComponent.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private static deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  constructor(private rblService: RblService) { }

  ngOnInit(): void {
    this.rblService.getStations().subscribe(stations => this.stations = stations);
  }

  search(event: any) {
    this.results = this.stations.filter(station => station.name.toLowerCase().indexOf(event.query.toLowerCase()) !== -1);
  }

  showStation(station: Station) {
    this.selected.emit(station);
  }

  useGeolocation() {
    navigator.geolocation.getCurrentPosition(position => {
      this.nearStations = this.findStations(position.coords);
    });
  }

  findStations(coords: Coordinates): { distance: number; station: Station }[] {
    return this.stations.map(item => {
      return {station: item, distance: SearchComponent.calculateDistance(coords, item)};
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

  selectStation(event: any) {
    this.selected.emit(event.data);
  }
}
