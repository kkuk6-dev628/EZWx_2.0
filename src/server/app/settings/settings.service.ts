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
  create(dto: CreateUserSettingsDto) {
    return this.userSettingsRepository.create(dto);
  }

  async update(dto: UpdateUserSettingsDto) {
    return await this.userSettingsRepository.save(dto);
  }
}
