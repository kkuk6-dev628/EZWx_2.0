import { SettingsService } from './settings.service';
import { Body, Controller, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CreateUserSettingsDto, UpdateUserSettingsDto } from './dto/create_settings_dto';

@Controller('settings')
export class SettingsController {
  constructor(private settingService: SettingsService) {}

  @Get(':id')
  find(@Param('id') id: string) {
    return this.settingService.find(+id);
  }

  @Post('create')
  @HttpCode(200)
  create(@Body() createUserSettingsDto: CreateUserSettingsDto) {
    return this.settingService.create(createUserSettingsDto);
  }

  @Patch('update')
  @HttpCode(200)
  update(@Body() updateUserSettingsDto: UpdateUserSettingsDto) {
    return this.settingService.update(updateUserSettingsDto);
  }
}
