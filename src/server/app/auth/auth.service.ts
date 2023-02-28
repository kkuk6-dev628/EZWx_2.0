import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthSignupDto, AuthSinginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { TypeORMError } from 'typeorm';
import { JwtAuthService } from './jwt/jwt-auth.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtAuthService,
    protected settingsService: SettingsService
  ) {}

  async signup(dto: AuthSignupDto) {
    const hash = await bcrypt.hash(dto.password, 2);

    const { password, confirmPassword, ...newDto } = dto;

    try {
      const user = await this.userService.create({
        hash,
        ...newDto,
      });


      const userSettings = await this.settingsService.create({
        user_id: user.id,
        default_home_airport: '',
        default_temperature_unit: true,
        default_time_display_unit: true,
        default_wind_speed_unit: true,
        default_distance_unit: true,
        default_visibility_unit: true,
        max_takeoff_weight_category: 'light',
        true_airspeed: 2,
        ceiling_at_departure_min:0,
        ceiling_at_departure_max:6000,
        surface_visibility_at_departure_min:0,
        surface_visibility_at_departure_max:12,
        crosswinds_at_departure_airport_min:0,
        crosswinds_at_departure_airport_max:35,
        ceiling_along_route_min: 0,
        ceiling_along_route_max: 6000,
        surface_visibility_along_route_min: 0,
        surface_visibility_along_route_max: 12,
        en_route_icing_probability_min: 0,
        en_route_icing_probability_max: 100,
        en_route_icing_intensity_min: 0,
        en_route_icing_intensity_max: 100,
        en_route_turbulence_intensity_min: 0,
        en_route_turbulence_intensity_max: 100,
        en_route_convective_potential_min: 0,
        en_route_convective_potential_max: 10,
        ceiling_at_destination_min: 0,
        ceiling_at_destination_max: 600,
        surface_visibility_at_destination_min: 0,
        surface_visibility_at_destination_max: 12,
        crosswinds_at_destination_airport_min: 0,
        crosswinds_at_destination_airport_max: 35,
      });

      const accessToken = await this.jwtService.login({
        id: user.id,
        email: user.email,
      });


      return {
        access_token: accessToken,
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      };
    } catch (err) {
      if (err instanceof TypeORMError) {
        if (/(duplicate key)[\s\S]/.test(err.message)) {
          throw new BadRequestException('email is already exists');
        }
      }
    }
  }

  async signin(dto: AuthSinginDto): Promise<{
    access_token: string;
    id: number;
    email: string;
    displayName: string;
  }> {
    const user = await this.userService.findOne({
      where: {
        email: dto.email,
      },
    });

    console.log('user is ', user.displayName);

    if (!user) throw new ForbiddenException('email or password incorrect');

    const pwMatches = await bcrypt.compare(dto.password, user.hash);

    if (!pwMatches) throw new ForbiddenException('email or password incorrect');

    const accessToken = await this.jwtService.login({
      id: user.id,
      email: user.email,
    });

    return {
      access_token: accessToken,
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }
}
