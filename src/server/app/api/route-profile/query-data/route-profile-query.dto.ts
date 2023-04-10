import { IsNotEmpty } from 'class-validator';

export class RouteProfileQueryDto {
  @IsNotEmpty()
  queryPoints: GeoJSON.Position[];
}
