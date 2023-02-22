import { Controller, Get } from '@nestjs/common';
import { StationTimeService } from './station-time.service';

@Controller('api/station-time')
export class StationTimeController {
  constructor(private stationTimeService: StationTimeService) {}

  @Get('findAll')
  findAll() {
    return this.stationTimeService.findAll({});
  }
}
