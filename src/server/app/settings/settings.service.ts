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
    return await this.userSettingsRepository.findOneBy({
      id,
    });
  }
  async create(dto: CreateUserSettingsDto) {
    const newUserSettings = this.userSettingsRepository.create(dto);
      console.log('newUserSettings: ',newUserSettings);
      return await this.userSettingsRepository.save(newUserSettings);
    }


  async update(dto: UpdateUserSettingsDto) {
    return await this.userSettingsRepository.save(dto);
  }
}
