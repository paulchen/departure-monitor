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

  private stationDetails: StationDetails;
  private rblData: { [rbl: string]: Departure[] } = {};

  constructor(private rblService: RblService) { }

  ngOnInit(): void {
    this.rblService.getStationDetails(this.station).subscribe(stationDetails => {
      let previousPlatform: Platform;
      stationDetails.platforms.forEach(currentPlatform => {
        currentPlatform.showLines = !previousPlatform || JSON.stringify(previousPlatform.line_names) !== JSON.stringify(currentPlatform.line_names);
        previousPlatform = currentPlatform;
      });

      this.stationDetails = stationDetails;
      this.updateMonitor();
    });
  }

  private updateMonitor(): void {
    const rbls = this.stationDetails.platforms.map(platform => platform.rbl);
    this.rblService.getDepartureData(rbls).subscribe(data => {
      this.rblData = data;
    });
  }

  doReset() {
    this.selectStation.emit(this.station);
  }
}
