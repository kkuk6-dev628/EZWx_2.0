import { IsEmail, IsNotEmpty } from 'class-validator';

export class RoutePointsDto {
  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  lng: number;
}
export class AuthSingingDto {
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
