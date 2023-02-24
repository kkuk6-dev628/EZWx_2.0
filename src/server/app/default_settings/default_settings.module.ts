import { Module } from '@nestjs/common';
import { DefaultSettingsService } from './default_settings.service';
import { DefaultSettingsController } from './default_settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultSetting } from './default_setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DefaultSetting])],
  controllers: [DefaultSettingsController],
  providers: [DefaultSettingsService]
})
export class DefaultSettingsModule {}
