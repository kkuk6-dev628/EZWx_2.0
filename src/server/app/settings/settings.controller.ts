import { SettingsService } from './settings.service';
import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CreateUserSettingsDto } from './dto/create_settings_dto';

@Controller('settings')
export class SettingsController {

  constructor (private settingService: SettingsService) {}

  @Get(':id') 
  find(@Param('id') id: string){
    return this.settingService.find(+id);
  } 

  @Post('/add')
  @HttpCode(200)
  create(@Body() createUserSettingsDto:CreateUserSettingsDto){
    return this.settingService.create(createUserSettingsDto)
  }
  
}
