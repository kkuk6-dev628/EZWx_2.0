import { IsNotEmpty } from 'class-validator';

export class RouteProfileQueryDto {
  @IsNotEmpty()
  queryPoints: GeoJSON.Position[];

  elevations: number[];
}

export class RouteSegmentsDto {
  @IsNotEmpty()
  arriveTime: number;
  airport: {
    key: string;
    name: string;
    type: string;
  };
  properties: any;
}
