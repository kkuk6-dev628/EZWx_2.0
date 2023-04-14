import { Body, Controller, Post } from '@nestjs/common';
import { RouteProfileQueryDataService } from './route-profile-query-data.service';
import { RouteProfileQueryDto } from './route-profile-query.dto';

@Controller('api/route-profile/data')
export class RouteProfileQueryDataController {
  constructor(private routeProfileQueryDataService: RouteProfileQueryDataService) {}

  @Post('cat')
  cat(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryCat(query);
  }

  @Post('mwturb')
  mwturb(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryMwturb(query);
  }
  @Post('humidity')
  humidity(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryHumidity(query);
  }
  @Post('temperature')
  temperature(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryTemperature(query);
  }
  @Post('gfs-winddirection')
  gfsWindDirection(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryGfsWindDirection(query);
  }
  @Post('gfs-windspeed')
  gfsWindSpeed(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryGfsWindSpeed(query);
  }
}
