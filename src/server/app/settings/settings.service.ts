import { UserSettings } from './settings.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserSettingsDto, UpdateUserSettingsDto } from './dto/create_settings_dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private userSettingsRepository: Repository<UserSettings>,
  ) {}
  async find(user_id: any) {
    try {
      return await this.userSettingsRepository.findOne({
        where: {
          user_id,
        },
      });
    } catch (error) {
      console.log('error', error);
    }
  }
  async create(dto: CreateUserSettingsDto) {
    const newUserSettings = this.userSettingsRepository.create(dto);
    console.log('newUserSettings: ', newUserSettings);
    return await this.userSettingsRepository.save(newUserSettings);
  }

  async update(dto: any) {

    let {
      ceiling_at_departure,
      surface_visibility_at_departure,
      crosswinds_at_departure_airport,
      ceiling_along_route,
      surface_visibility_along_route,
      en_route_icing_probability,
      en_route_icing_intensity,
      en_route_turbulence_intensity,
      en_route_convective_potential,
      ceiling_at_destination,
      surface_visibility_at_destination,
      crosswinds_at_destination_airport, ...rest
    } =dto

  rest.ceiling_at_departure_min= ceiling_at_departure[0];
  rest.ceiling_at_departure_max= ceiling_at_departure[1];
  rest.surface_visibility_at_departure_min= surface_visibility_at_departure[0];
  rest.surface_visibility_at_departure_max= surface_visibility_at_departure[1];
  rest.crosswinds_at_departure_airport_min= crosswinds_at_departure_airport[0];
  rest.crosswinds_at_departure_airport_max= crosswinds_at_departure_airport[1];
  rest.ceiling_along_route_min= ceiling_along_route[0];
  rest.ceiling_along_route_max= ceiling_along_route[1];
  rest.surface_visibility_along_route_min= surface_visibility_along_route[0];
  rest.surface_visibility_along_route_max= surface_visibility_along_route[1];
  rest.en_route_icing_probability_min= en_route_icing_probability[0];
  rest.en_route_icing_probability_max= en_route_icing_probability[1];
  rest.en_route_turbulence_intensity_min= en_route_turbulence_intensity[0];
  rest.en_route_turbulence_intensity_max= en_route_turbulence_intensity[1];
  rest.en_route_convective_potential_min= en_route_convective_potential[0];
  rest.en_route_convective_potential_max= en_route_convective_potential[1];
  rest.ceiling_at_destination_min= ceiling_at_destination[0];
  rest.ceiling_at_destination_max= ceiling_at_destination[1];
  rest.surface_visibility_at_destination_min= surface_visibility_at_destination[0];
  rest.surface_visibility_at_destination_max= surface_visibility_at_destination[1];
  rest.crosswinds_at_destination_airport_min= crosswinds_at_destination_airport[0];
  rest.crosswinds_at_destination_airport_max= crosswinds_at_destination_airport[1];
  
    return await this.userSettingsRepository.save(rest);
  }
}