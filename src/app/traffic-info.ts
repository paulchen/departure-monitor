export class TrafficInfo {
  rbl?: number;
  line?: string;
  category?: number;
  title: string;
  description: string;
  start_time?: Date;
  end_time?: Date;
}

export class Disruptions {
  lines: {[line: string]: TrafficInfo[]};
  rbls: {[rbl: number]: TrafficInfo[]};
}
