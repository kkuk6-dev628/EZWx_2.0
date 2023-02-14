import { SettingsService } from './settings.service';
import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';

@Controller('settings')
export class SettingsController {

  constructor (private settingService: SettingsService) {}

  @Get('/') 
  getAllSettings(){
    return this.settingService.getAllSettings();
  } 

  @Post('/add')
  @HttpCode(200)
  addUserSettings(@Body() settingsData){
    return {data:settingsData};
  }
}
