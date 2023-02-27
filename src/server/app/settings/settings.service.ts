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
  async find(id: any) {
    console.log('id', id);
    try {
      return await this.userSettingsRepository.findOne({
        where: {
          user_id: +id,
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

  async update(dto: UpdateUserSettingsDto) {
    return await this.userSettingsRepository.save(dto);
  }
}
