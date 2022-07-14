import {TrafficInfo} from './traffic-info';

export class Platform {
  rbl: number;
  platform: string;
  line_names: string[];
  line_ids: string[];
  showLines: boolean;
  showLinesCompact: boolean;
  trafficInfos: TrafficInfo[];
  messages = [];
}
