import { UserSettings } from './settings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserSettings])],
    controllers:[SettingsController],
    providers: [SettingsService]
})
export class SettingsModule {}
