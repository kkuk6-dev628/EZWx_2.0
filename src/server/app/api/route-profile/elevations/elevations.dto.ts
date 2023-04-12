import { IsNotEmpty } from 'class-validator';

export class ElevationsDto {
  @IsNotEmpty()
  queryPoints: GeoJSON.Position[];
}
