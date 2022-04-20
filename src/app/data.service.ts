import { Injectable } from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {StationData} from './main/station';
import {RblService} from "./rbl.service";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private replaySubject: ReplaySubject<StationData> = new ReplaySubject<StationData>(1);

  constructor(private rblService: RblService) {
    this.rblService.getStations().subscribe(stationData => {
      for (const line of stationData.lines) {
        for (const type of stationData.line_types) {
          if (line.type == type.id) {
            line.line_type = type;
          }
        }
      }

      for (const station of stationData.stations) {
        station.line_count = station.line_list.length;

        let lines = [];
        for (const line of stationData.lines) {
          if (station.line_list.includes(line.id)) {
            lines.push(line)
          }
        }

        station.lines = lines;
      }

      this.replaySubject.next(stationData);
    });
  }

  getStations(): Observable<StationData> {
    return this.replaySubject.asObservable()
  }
}
