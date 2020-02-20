import { Component, OnInit } from '@angular/core';
import { RblService } from '../rbl.service'
import { Departure } from '../departure'

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent implements OnInit {

  private rbls: Number[] = [4107, 4122, 5700, 5701];
  private rblData: { [rbl: string]: Departure[] } = {};

  constructor(private rblService: RblService) { }

  ngOnInit(): void {
    this.updateMonitor();
  }

  private updateMonitor(): void {
    this.rblService.getDepartureData(this.rbls).subscribe(data => {
      this.rblData = data;
    });
  }
}
