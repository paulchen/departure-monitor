import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departure } from './departure';
import {Station} from './search/station';
import {StationDetails} from './station-details';

@Injectable({
  providedIn: 'root'
})
export class RblService {
  readonly stationsUrl = 'https://rueckgr.at/wienerlinien_dev/map/stations.php';
  readonly stationDetailsUrl = 'https://rueckgr.at/wienerlinien_dev/map/platforms.php?id=';
  readonly departuresUrl = 'https://rueckgr.at/wienerlinien_dev/map/rbls.php?ids=';

  constructor(private http: HttpClient) { }

  getDepartureData(rbls: number[]): Observable<{ [rbl: string]: Departure[] }> {
    const numberString = rbls.join(',');
    return this.http.get<{ [rbl: string]: Departure[] }>(this.departuresUrl + numberString);
  }

  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>(this.stationsUrl);
  }

  getStationDetails(station: Station): Observable<StationDetails> {
    return this.http.get<StationDetails>(this.stationDetailsUrl + station.id);
  }
}
