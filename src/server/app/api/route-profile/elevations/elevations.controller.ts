import { Body, Controller, Post } from '@nestjs/common';
import { ElevationsService } from './elevations.service';
import { ElevationsDto } from './elevations.dto';

@Controller('api/route-profile/data')
export class ElevationsController {
  constructor(private elevationsService: ElevationsService) {}

  @Post('elevations')
  async findAll(@Body() query: ElevationsDto) {
    return await this.elevationsService.executeGet(query.queryPoints);
  }
}
