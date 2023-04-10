import { Body, Controller, Post } from '@nestjs/common';
import { RouteProfileQueryDataService } from './route-profile-query-data.service';
import { RouteProfileQueryDto } from './route-profile-query.dto';

@Controller('api/route-profile-data')
export class RouteProfileQueryDataController {
  constructor(private routeProfileQueryDataService: RouteProfileQueryDataService) {}

  @Post('findAll')
  findAll(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.findAll(query);
  }
}
