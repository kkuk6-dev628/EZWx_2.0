import { SettingsService } from './settings.service';
import { Body, Controller, Get, HttpCode, Param, Patch, Post, Put } from '@nestjs/common';
import { CreateUserSettingsDto, UpdateUserSettingsDto } from './dto/create_settings_dto';

@Controller('settings')
export class SettingsController {
  constructor(private settingService: SettingsService) {}

  @Get(':user_id')
  find(@Param('user_id') user_id: string) {
    return this.settingService.find(+user_id);
  }

  @Post('create')
  @HttpCode(200)
  create(@Body() createUserSettingsDto: CreateUserSettingsDto) {
    return this.settingService.create(createUserSettingsDto);
  }

  @Put('update')
  @HttpCode(200)
  update(@Body() updateUserSettingsDto: UpdateUserSettingsDto) {
    return this.settingService.update(updateUserSettingsDto);
  }
}