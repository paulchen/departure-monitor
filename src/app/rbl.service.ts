import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departure } from './departure';
import {StationData} from './main/station';
import {StationDetails} from './station-details';
import {environment} from '../environments/environment';
import {Disruptions} from './traffic-info';

@Injectable({
  providedIn: 'root'
})
export class RblService {
  readonly stationsUrl = 'map/stations.php';
  readonly stationDetailsUrl = 'map/platforms.php?id=';
  readonly departuresUrl = 'map/rbls.php?ids=';
  readonly disruptionsUrl = 'map/disruptions.php?id='

  constructor(private http: HttpClient) { }

  getDepartureData(rbls: number[]): Observable<{ [rbl: string]: Departure[] }> {
    const numberString = rbls.join(',');
    return this.http.get<{ [rbl: string]: Departure[] }>(environment.apiUrl + this.departuresUrl + numberString);
  }

  getStations(): Observable<StationData> {
    return this.http.get<StationData>(environment.apiUrl + this.stationsUrl);
  }

  getStationDetails(stationId: number): Observable<StationDetails> {
    return this.http.get<StationDetails>(environment.apiUrl + this.stationDetailsUrl + stationId);
  }

  getDisruptions(stationId: number): Observable<Disruptions> {
    return this.http.get<Disruptions>(environment.apiUrl + this.disruptionsUrl + stationId);
  }
}
