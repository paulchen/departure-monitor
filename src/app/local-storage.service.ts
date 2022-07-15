import { Injectable } from '@angular/core';
import {environment} from "../environments/environment";
import {Station, StationData} from "./main/station";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private readonly historySwitchKey = 'save_history';
  private readonly stationHistoryKey = 'station_history';

  isHistoryEnabled(): boolean {
    return localStorage.getItem(environment.localStoragePrefix + this.historySwitchKey) === 'true';
  }

  updateHistory(station: number): void {
    const saveHistory = localStorage.getItem(environment.localStoragePrefix + this.historySwitchKey);
    if (saveHistory !== 'true') {
      return;
    }

    const oldHistory = localStorage.getItem(environment.localStoragePrefix + this.stationHistoryKey);
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
    localStorage.setItem(environment.localStoragePrefix + this.stationHistoryKey, newHistory);
  }

  getHistory(stationData: StationData): Station[] {
    if (!this.isHistoryEnabled()) {
      return [];
    }

    const stationHistory = localStorage.getItem(environment.localStoragePrefix + this.stationHistoryKey);
    if (stationHistory === null) {
      return [];
    }

    return stationHistory
      .split(',')
      .map(id => {
        return stationData.stations.find(station => station.id.toString() === id);
      })
      .filter(station => station !== undefined);
  }

  enableHistory(): void {
    localStorage.setItem(environment.localStoragePrefix + this.historySwitchKey, 'true')
  }

  disableHistory(): void {
    localStorage.removeItem(environment.localStoragePrefix + this.historySwitchKey);
    localStorage.removeItem(environment.localStoragePrefix + this.stationHistoryKey);
  }
}
