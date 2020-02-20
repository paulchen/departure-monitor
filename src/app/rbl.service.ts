import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departure } from './departure'

@Injectable({
  providedIn: 'root'
})
export class RblService {
  readonly backendUrl = "https://rueckgr.at/wienerlinien/map/rbls.php?ids=";

  constructor(private http: HttpClient) { }

  getDepartureData(rbls: Number[]): Observable<{ [rbl: string]: Departure[] }> {
    let numberString = rbls.join(",");
    return this.http.get<{ [rbl: string]: Departure[] }>(this.backendUrl + numberString);
  }
}
