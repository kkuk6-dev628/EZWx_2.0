import { JwtAuthGuard } from './../auth/jwt/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { Body, Controller, Get, HttpCode, Request, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
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
  @UseGuards(JwtAuthGuard)
  update(@Request() request, @Body() updateUserSettingsDto: UpdateUserSettingsDto) {
    return this.settingService.update(request.user, updateUserSettingsDto);
  }

  @Patch('/restore/:user_id')
  restore(@Param('user_id') user_id: string) {
    return this.settingService.restore(+user_id);
  }
}
