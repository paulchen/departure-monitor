import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { RblService } from '../rbl.service';
import { Departure } from '../departure';
import {Station} from '../search/station';
import {StationDetails} from '../station-details';
import {Platform} from '../platform';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent implements OnInit {
  @Input() station: Station;
  @Output() selectStation = new EventEmitter<Station>();

  stationDetails: StationDetails;
  rblData: { [rbl: string]: Departure[] } = {};
  rblDataCompact: { [rbl: string]: Departure[] } = {};
  loading = false;
  compact = true;
  timeout;

  constructor(private rblService: RblService) { }

  private static getCompactRblData(rblData: { [rbl: string]: Departure[] }): { [rbl: string]: Departure[] } {
    const result: { [rbl: string]: Departure[] } = {};
    Object.entries(rblData).forEach(([key, value]) => {
      result[key] = MonitorComponent.getCompactRbl(value);
    });
    return result;
  }

  private static getCompactRbl(departures: Departure[]): Departure[] {
    const result: Departure[] = [];
    const multipleLines = MonitorComponent.countLines(departures) > 1;
    const entriesByLine: { [line: string]: number} = {};
    departures.forEach(departure => {
      const line = departure.line;
      if(!entriesByLine.hasOwnProperty(line)) {
        entriesByLine[line] = 0;
      }
      entriesByLine[line] = entriesByLine[line] + 1;
      if((multipleLines && entriesByLine[line] <= 1) || (!multipleLines && entriesByLine[line] <= 2)) {
        result.push(departure);
      }
    });
    return result;
  }

  private static countLines(departures: Departure[]): number {
    return new Set(departures.map(d => d.line)).size;
  }

  ngOnInit(): void {
    this.rblService.getStationDetails(this.station).subscribe(stationDetails => {
      let previousPlatform: Platform;
      stationDetails.platforms.forEach(currentPlatform => {
        currentPlatform.showLines = !previousPlatform ||
          JSON.stringify(previousPlatform.line_names) !== JSON.stringify(currentPlatform.line_names);
        previousPlatform = currentPlatform;
      });

      this.stationDetails = stationDetails;
      this.updateMonitor();
    });
  }

  updateMonitor(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    if (!this.stationDetails) {
      return;
    }

    const rbls = this.stationDetails.platforms.map(platform => platform.rbl);
    this.loading = true;
    this.rblService.getDepartureData(rbls).subscribe(data => {
      this.loading = false;
      this.rblData = data;
      this.rblDataCompact = MonitorComponent.getCompactRblData(data);
      this.timeout = setTimeout(() => { this.updateMonitor(); }, 30000);
    });
  }

  doReset() {
    this.stationDetails = null;
    this.selectStation.emit(this.station);
  }
}
