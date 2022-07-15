import {Injectable} from '@angular/core';
import {environment} from "../environments/environment";
import {Station, StationData} from "./main/station";
import {StationHistory} from "./station-history";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private readonly historySwitchKey = environment.localStoragePrefix + 'save_history';
  private readonly oldHistoryKey = environment.localStoragePrefix + 'station_history'
  private readonly stationHistoryKey = environment.localStoragePrefix + 'station_history_new';

  isHistoryEnabled(): boolean {
    return localStorage.getItem(this.historySwitchKey) === 'true';
  }

  updateHistory(station: number): void {
    const saveHistory = localStorage.getItem(this.historySwitchKey);
    if (saveHistory !== 'true') {
      return;
    }

    const history = this.loadHistory();
    if (history.items.hasOwnProperty(station)) {
      history.items[station].count++;
      history.items[station].lastUse = new Date();
    }
    else {
      history.items[station] = { station: parseInt(station.toString()), count: 1, lastUse: new Date() };
    }
    localStorage.setItem(this.stationHistoryKey, JSON.stringify(history));
  }

  private checkForMigration() {
    const oldHistory = localStorage.getItem(this.oldHistoryKey);
    if (oldHistory !== null) {
      const stationIds = oldHistory.split(',');
      const historyItems = {};
      for (let stationId of stationIds) {
        historyItems[stationId] = { station: parseInt(stationId), count: 1, lastUse: new Date() };
      }
      const newHistory: StationHistory = { items: historyItems };

      localStorage.setItem(this.stationHistoryKey, JSON.stringify(newHistory));
      localStorage.removeItem(this.oldHistoryKey);
    }
  }

  private loadHistory(): StationHistory {
    const json = localStorage.getItem(this.stationHistoryKey);
    if (json === null) {
      return { items: {} };
    }
    try {
      return JSON.parse(json);
    }
    catch (e) {
      return { items: {} }
    }
  }

  getHistory(stationData: StationData): Station[] {
    if (!this.isHistoryEnabled()) {
      return [];
    }

    this.checkForMigration();

    const stationHistory = this.loadHistory();
    const items = Object.values(stationHistory.items);
    items.sort((a, b) => {
      if (a.count < b.count) {
        return 1;
      }
      if (a.count > b.count) {
        return -1;
      }
      if (a.lastUse < b.lastUse) {
        return 1;
      }
      if (a.lastUse > b.lastUse) {
        return -1;
      }
      return 0;
    });

    return items
      .slice(0, 10)
      .map(historyItem => {
        return stationData.stations.find(station => station.id === historyItem.station);
      })
      .filter(station => station !== undefined);
  }

  enableHistory(): void {
    localStorage.setItem(this.historySwitchKey, 'true')
  }

  disableHistory(): void {
    localStorage.removeItem(this.oldHistoryKey);
    localStorage.removeItem(this.historySwitchKey);
    localStorage.removeItem(this.stationHistoryKey);
  }
}
