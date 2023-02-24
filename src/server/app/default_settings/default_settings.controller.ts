import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DefaultSettingsService } from './default_settings.service';
import { CreateDefaultSettingDto } from './dto/create-default_setting.dto';

@Controller('default-settings')
export class DefaultSettingsController {
  constructor(private readonly defaultSettingsService: DefaultSettingsService) {}

  @Post()
  create(@Body() createDefaultSettingDto: CreateDefaultSettingDto) {
    return this.defaultSettingsService.create(createDefaultSettingDto);
  }

  // @Get()
  // findAll() {
  //   return this.defaultSettingsService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.defaultSettingsService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDefaultSettingDto: CreateDefaultSettingDto) {
  //   return this.defaultSettingsService.update(+id, updateDefaultSettingDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.defaultSettingsService.remove(+id);
  }
}
