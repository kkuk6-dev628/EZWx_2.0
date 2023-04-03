import { DefaultSetting } from './../default_settings/default_setting.entity';
import { UserSettings } from './settings.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserSettingsDto, UpdateUserSettingsDto } from './dto/create_settings_dto';
import { User } from 'src/server/common/types/user';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private userSettingsRepository: Repository<UserSettings>,
    @InjectRepository(DefaultSetting)
    private defaultSettingsRepository: Repository<DefaultSetting>,
  ) {}
  async find(user_id: number) {
    try {
      let res;
      try {
        res = await this.userSettingsRepository.findOne({
          where: {
            user_id,
          },
        });
      } catch {
        console.log('No user Account');
      }

      if (!res) {
        res = await this.defaultSettingsRepository
          .createQueryBuilder('default_setting')
          .orderBy('default_setting.id', 'ASC')
          .getOne();
      }
      const { id, ...rest } = res;
      const modifiedData = getModifiedData(rest);
      console.log(modifiedData);
      return modifiedData;
    } catch (error) {
      console.log('error', error);
    }
  }
  async create(dto: CreateUserSettingsDto) {
    const newUserSettings = this.userSettingsRepository.create(dto);
    console.log('newUserSettings: ', newUserSettings);
    return await this.userSettingsRepository.save(newUserSettings);
  }

  async update(user: User, dto: UpdateUserSettingsDto) {
    try {
      const {
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
        crosswinds_at_destination_airport,
        ...rest
      } = dto;
      const modified_dto = {
        ceiling_at_departure_min: ceiling_at_departure[0],
        ceiling_at_departure_max: ceiling_at_departure[1],
        surface_visibility_at_departure_min: surface_visibility_at_departure[0],
        surface_visibility_at_departure_max: surface_visibility_at_departure[1],
        crosswinds_at_departure_airport_min: crosswinds_at_departure_airport[0],
        crosswinds_at_departure_airport_max: crosswinds_at_departure_airport[1],
        ceiling_along_route_min: ceiling_along_route[0],
        ceiling_along_route_max: ceiling_along_route[1],
        surface_visibility_along_route_min: surface_visibility_along_route[0],
        surface_visibility_along_route_max: surface_visibility_along_route[1],
        en_route_icing_probability_min: en_route_icing_probability[0],
        en_route_icing_probability_max: en_route_icing_probability[1],
        en_route_icing_intensity_min: en_route_icing_intensity[0],
        en_route_icing_intensity_max: en_route_icing_intensity[1],
        en_route_turbulence_intensity_min: en_route_turbulence_intensity[0],
        en_route_turbulence_intensity_max: en_route_turbulence_intensity[1],
        en_route_convective_potential_min: en_route_convective_potential[0],
        en_route_convective_potential_max: en_route_convective_potential[1],
        ceiling_at_destination_min: ceiling_at_destination[0],
        ceiling_at_destination_max: ceiling_at_destination[1],
        surface_visibility_at_destination_min: surface_visibility_at_destination[0],
        surface_visibility_at_destination_max: surface_visibility_at_destination[1],
        crosswinds_at_destination_airport_min: crosswinds_at_destination_airport[0],
        crosswinds_at_destination_airport_max: crosswinds_at_destination_airport[1],
        ...rest,
      };
      let res = await this.userSettingsRepository.findOne({ where: { user_id: user.id } });
      if (res) {
        res = await this.userSettingsRepository.save({ id: res.id, ...modified_dto });
      } else {
        const settings = this.userSettingsRepository.create(modified_dto);
        settings.user_id = user.id;
        res = await this.userSettingsRepository.save(settings);
      }
      const { id, ...userSettings } = res;
      const modifiedData = getModifiedData(userSettings);
      return modifiedData;
    } catch (error) {
      console.log('error', error);
    }
  }

  async restore(user_id: number) {
    try {
      let res;
      try {
        res = await this.userSettingsRepository.findOne({
          where: {
            user_id,
          },
        });
      } catch {
        console.log('No user Account');
      }

      if (!res) {
        return null;
      }
      const { id: defaultSettingId, ...defaultSettings } = await this.defaultSettingsRepository
        .createQueryBuilder('default_setting')
        .orderBy('default_setting.id', 'ASC')
        .getOne();
      res = await this.userSettingsRepository.save({ id: res.id, user_id, ...defaultSettings });
      const { id, ...rest } = res;
      const modifiedData = getModifiedData(rest);
      return modifiedData;
    } catch (error) {
      console.log('error', error);
    }
  }
}

const getModifiedData = (data) => {
  const {
    ceiling_at_departure_min,
    ceiling_at_departure_max,
    surface_visibility_at_departure_min,
    surface_visibility_at_departure_max,
    crosswinds_at_departure_airport_min,
    crosswinds_at_departure_airport_max,
    ceiling_along_route_min,
    ceiling_along_route_max,
    surface_visibility_along_route_min,
    surface_visibility_along_route_max,
    en_route_icing_probability_min,
    en_route_icing_probability_max,
    en_route_icing_intensity_min,
    en_route_icing_intensity_max,
    en_route_turbulence_intensity_min,
    en_route_turbulence_intensity_max,
    en_route_convective_potential_min,
    en_route_convective_potential_max,
    ceiling_at_destination_min,
    ceiling_at_destination_max,
    surface_visibility_at_destination_min,
    surface_visibility_at_destination_max,
    crosswinds_at_destination_airport_min,
    crosswinds_at_destination_airport_max,
    ...rest
  } = data;

  const modified_dto = {
    ceiling_at_departure: [ceiling_at_departure_min, ceiling_at_departure_max],
    surface_visibility_at_departure: [surface_visibility_at_departure_min, surface_visibility_at_departure_max],
    crosswinds_at_departure_airport: [crosswinds_at_departure_airport_min, crosswinds_at_departure_airport_max],
    ceiling_along_route: [ceiling_along_route_min, ceiling_along_route_max],
    surface_visibility_along_route: [surface_visibility_along_route_min, surface_visibility_along_route_max],
    en_route_icing_probability: [en_route_icing_probability_min, en_route_icing_probability_max],
    en_route_icing_intensity: [en_route_icing_intensity_min, en_route_icing_intensity_max],
    en_route_turbulence_intensity: [en_route_turbulence_intensity_min, en_route_turbulence_intensity_max],
    en_route_convective_potential: [en_route_convective_potential_min, en_route_convective_potential_max],
    ceiling_at_destination: [ceiling_at_destination_min, ceiling_at_destination_max],
    surface_visibility_at_destination: [surface_visibility_at_destination_min, surface_visibility_at_destination_max],
    crosswinds_at_destination_airport: [crosswinds_at_destination_airport_min, crosswinds_at_destination_airport_max],
  };

  return { ...modified_dto, ...rest };
};
