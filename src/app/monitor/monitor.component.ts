import {Component, OnInit} from '@angular/core';
import { RblService } from '../rbl.service';
import { Departure } from '../departure';
import {StationDetails} from '../station-details';
import {Platform} from '../platform';
import {ActivatedRoute, Router} from '@angular/router';
import {LocalStorageService} from "../local-storage.service";
import {Disruptions, TrafficInfo} from '../traffic-info';
import {Button} from 'primeng/button';
import {InputSwitch} from 'primeng/inputswitch';
import {FormsModule} from '@angular/forms';
import {MessagesModule} from 'primeng/messages';
import {Tag} from 'primeng/tag';
import {Inplace} from 'primeng/inplace';
import {NgForOf, NgIf} from '@angular/common';
import {ProgressSpinner} from 'primeng/progressspinner';
import {TableModule} from 'primeng/table';
import {Message} from 'primeng/message';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  imports: [
    Button,
    InputSwitch,
    FormsModule,
    Tag,
    Inplace,
    NgIf,
    ProgressSpinner,
    TableModule,
    NgForOf,
    Message
  ],
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent implements OnInit {
  stationId: number;
  stationDetails: StationDetails;
  rblData: { [rbl: string]: Departure[] } = {};
  rblDataCompact: { [rbl: string]: Departure[] } = {};
  loading = false;
  compact = true;
  timeout;
  anyRbl: boolean;

  constructor(private rblService: RblService, private route: ActivatedRoute, private router: Router, private localStorageService: LocalStorageService) { }

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
            if(!departure.barrier_free ||
                existingDeparture.barrier_free ||
                parseInt(departure.time, 10) > 30) {
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
      this.stationId = params.id;
      this.rblService.getStationDetails(params.id).subscribe(stationDetails => {
        this.localStorageService.updateHistory(params.id);
        if (stationDetails.name !== stationName) {
          this.router.navigate(['/notFound']).then(() => { /* empty */ });
        }

        this.stationDetails = stationDetails;
        this.updateMonitor();
      });
    });
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
    this.rblService.getDepartureData(rbls).subscribe(rblData => {
      this.rblService.getDisruptions(this.stationId).subscribe(disruptionsData => {
        this.loading = false;
        this.rblData = rblData;
        this.rblDataCompact = MonitorComponent.getCompactRblData(rblData);
        this.anyRbl = Object.keys(rblData).length > 0;
        this.timeout = setTimeout(() => { this.updateMonitor(); }, 30000);

        let previousPlatform: Platform;
        let previousPlatformCompact: Platform;
        this.stationDetails.platforms.forEach(currentPlatform => {
          currentPlatform.trafficInfos = this.findTrafficInfos(currentPlatform, disruptionsData);
          currentPlatform.showLines = !previousPlatform ||
            JSON.stringify(previousPlatform.line_names) !== JSON.stringify(currentPlatform.line_names);
          currentPlatform.showLinesCompact = (!previousPlatformCompact ||
              JSON.stringify(previousPlatformCompact.line_names) !== JSON.stringify(currentPlatform.line_names)) &&
            (this.rblData.hasOwnProperty(currentPlatform.rbl) || currentPlatform.trafficInfos.length > 0);
          previousPlatform = currentPlatform;
          if (this.rblData.hasOwnProperty(currentPlatform.rbl) || currentPlatform.trafficInfos.length > 0) {
            previousPlatformCompact = currentPlatform;
          }
        });

        this.stationDetails.platforms.forEach(currentPlatform => {
          currentPlatform.messages = [];
          currentPlatform.trafficInfos.forEach(trafficInfo => {
            const summary = trafficInfo.category == 1 ? 'Aufzug außer Betrieb' : trafficInfo.title;
            const element = {summary: summary, detail: trafficInfo.description};
            const now = new Date();
            if (currentPlatform.messages.findIndex(item => JSON.stringify(item) === JSON.stringify(element)) === -1 &&
              new Date(trafficInfo.start_time) <= now && new Date(trafficInfo.end_time) >= now) {
              currentPlatform.messages.push(element);
            }
          });
        });
      });
    });
  }

  private findTrafficInfos(currentPlatform: Platform, disruptionsData: Disruptions): TrafficInfo[] {
    const trafficInfos = [];
    for (const line of Object.keys(disruptionsData.lines)) {
      if (currentPlatform.line_names.includes(line)) {
        disruptionsData.lines[line].forEach(item => { trafficInfos.push(item)} );
      }
    }
    for (const platform of this.stationDetails.platforms) {
      if (JSON.stringify(platform.line_names) === JSON.stringify(currentPlatform.line_names)) {
        for (const rbl of Object.keys(disruptionsData.rbls)) {
          if (Number(platform.rbl) === Number(rbl)) {
            disruptionsData.rbls[rbl].forEach(item => { trafficInfos.push(item) });
          }
        }
      }
    }
    return trafficInfos;
  }

  doReset() {
    this.stationDetails = null;
    this.router.navigate(['/']).then(() => { /* empty */ });
  }
}
