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
}
