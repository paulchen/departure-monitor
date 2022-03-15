export class StationData {
  line_types: LineType[];
  lines: Line[];
  stations: Station[];
}

export class LineType {
  id: number;
  color: string;
}

export class Line {
  id: number;
  name: string;
  type: number;
  line_type: LineType;
  color: string;
}

export class Station {
  id: number;
  name: string;
  lat: number;
  lon: number;
  // tslint:disable-next-line:variable-name
  line_count: number;
  // tslint:disable-next-line:variable-name
  line_list: number[];
  lines: Line[];
}
