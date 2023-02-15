import { UserSettings } from './settings.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserSettingsDto } from './dto/create_settings_dto';

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
    return await this.userSettingsRepository.save(dto);
  }
}
