import {Component, OnInit} from '@angular/core';
import { RblService } from '../rbl.service';
import { Departure } from '../departure';
import {StationDetails} from '../station-details';
import {Platform} from '../platform';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent implements OnInit {
  stationDetails: StationDetails;
  rblData: { [rbl: string]: Departure[] } = {};
  rblDataCompact: { [rbl: string]: Departure[] } = {};
  loading = false;
  compact = true;
  timeout;
  anyRbl: boolean;

  constructor(private rblService: RblService, private route: ActivatedRoute, private router: Router) { }

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
      else {
        let add = true;
        result.forEach((existingDeparture) => {
          if(departure.line === existingDeparture.line && departure.towards.toLowerCase() === existingDeparture.towards.toLowerCase()) {
            if(!departure.barrier_free || existingDeparture.barrier_free) {
              add = false;
            }
            else if (parseInt(departure.time, 10) > 30) {
              add = false;
            }
          }
        });
        if(add) {
          result.push(departure);
        }
      }
    });
    return result;
  }

  private static countLines(departures: Departure[]): number {
    return new Set(departures.map(d => d.line)).size;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const stationName = params.name;
      this.rblService.getStationDetails(params.id).subscribe(stationDetails => {
        this.updateHistory(params.id);
        if (stationDetails.name !== stationName) {
          this.router.navigate(['/notFound']).then(() => {});
        }

        this.stationDetails = stationDetails;
        this.updateMonitor();
      });
    });
  }

  private updateHistory(station: number): void {
    const saveHistory = localStorage.getItem('save_history');
    if (saveHistory !== 'true') {
      return;
    }

    const oldHistory = localStorage.getItem('station_history');
    let newHistory;
    if (!oldHistory) {
      newHistory = station;
    }
    else {
      const history = oldHistory
        .split(',')
        .filter((item: string) => {
          return item !== station.toString();
        })
        .slice(0, 9);
      history.unshift(station.toString());
      newHistory = history.join(',')
    }
    localStorage.setItem('station_history', newHistory);
  }

  updateMonitor(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    if (!this.stationDetails) {
      return;
    }

    const rbls = this.stationDetails.platforms.filter(platform => platform.rbl != null).map(platform => platform.rbl);
    this.loading = true;
    this.rblService.getDepartureData(rbls).subscribe(data => {
      this.loading = false;
      this.rblData = data;
      this.rblDataCompact = MonitorComponent.getCompactRblData(data);
      this.anyRbl = Object.keys(data).length > 0;
      this.timeout = setTimeout(() => { this.updateMonitor(); }, 30000);

      let previousPlatform: Platform;
      let previousPlatformCompact: Platform;
      this.stationDetails.platforms.forEach(currentPlatform => {
        currentPlatform.showLines = !previousPlatform ||
          JSON.stringify(previousPlatform.line_names) !== JSON.stringify(currentPlatform.line_names);
        currentPlatform.showLinesCompact = (!previousPlatformCompact ||
          JSON.stringify(previousPlatformCompact.line_names) !== JSON.stringify(currentPlatform.line_names)) &&
          this.rblData.hasOwnProperty(currentPlatform.rbl);
        previousPlatform = currentPlatform;
        if(this.rblData.hasOwnProperty(currentPlatform.rbl)) {
          previousPlatformCompact = currentPlatform;
        }
      });
    });
  }

  doReset() {
    this.stationDetails = null;
    this.router.navigate(['/']).then(() => {});
  }
}
