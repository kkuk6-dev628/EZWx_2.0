import { IsNotEmpty } from 'class-validator';

export class CreateRoutePointDto {
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  position: string;
}

export class CreateRouteDto {
  @IsNotEmpty()
  departure: CreateRoutePointDto;

  @IsNotEmpty()
  destination: CreateRoutePointDto;

  routeOfFlight: CreateRoutePointDto[];

  @IsNotEmpty()
  altitude: number;

  @IsNotEmpty()
  useForecastWinds: boolean;
}
