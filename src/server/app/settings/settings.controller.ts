import { JwtAuthGuard } from './../auth/jwt/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { Body, Controller, Get, HttpCode, Request, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { CreateUserSettingsDto, UpdateUserSettingsDto } from './dto/create_settings_dto';
import { User } from '../user/user.entity';

@Controller('settings')
export class SettingsController {
  constructor(private settingService: SettingsService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  find(@Request() request) {
    return this.settingService.find(request.user.id);
  }

  @Post('create')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  create(@Body() createUserSettingsDto: CreateUserSettingsDto) {
    return this.settingService.create(createUserSettingsDto);
  }

  @Put('update')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  update(@Request() request, @Body() updateUserSettingsDto: UpdateUserSettingsDto) {
    return this.settingService.update(request.user, updateUserSettingsDto);
  }
}
