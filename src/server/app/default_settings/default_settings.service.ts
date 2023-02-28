import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateDefaultSettingDto } from './dto/create-default_setting.dto';
import { Repository } from 'typeorm';
import { DefaultSetting } from './default_setting.entity';

@Injectable()
export class DefaultSettingsService {
  constructor(
    @InjectRepository(DefaultSetting)
    private defaultSettingRepository: Repository<DefaultSetting>,
  ) {}
  async create(createDefaultSettingDto: CreateDefaultSettingDto) {
    return await this.defaultSettingRepository.save(createDefaultSettingDto);
  }

  // async findAll() {
  //   return await this.defaultSettingRepository.find()
  // }

  async findOne(id: number) {
    return await this.defaultSettingRepository.findOne({ where: { id } });
  }

  // async update(id: number, updateDefaultSettingDto:any) {
  //   return await this.defaultSettingRepository.preload(updateDefaultSettingDto)
  // }

  async remove(id: number) {
    const setting = await this.defaultSettingRepository.findOneBy({ id });
    return await this.defaultSettingRepository.remove(setting);
  }
}
