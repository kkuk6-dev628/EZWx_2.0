import { RouteOfFlight } from './../route-of-flight.entity';
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
  id?: number;

  @IsNotEmpty()
  departure: CreateRoutePointDto;

  @IsNotEmpty()
  destination: CreateRoutePointDto;

  routeOfFlight: RouteOfFlight[];

  @IsNotEmpty()
  altitude: number;

  @IsNotEmpty()
  useForecastWinds: boolean;
}
