export class StationHistory {
  items: {[station: string]: HistoryItem};
}

export class HistoryItem {
  station: number;
  count: number;
  lastUse: Date;
}
