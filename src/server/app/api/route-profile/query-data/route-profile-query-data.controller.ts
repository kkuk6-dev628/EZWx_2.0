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
  @Post('icing-prob')
  icingProv(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryIcingProb(query);
  }
  @Post('icing-sev')
  icingSev(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryIcingSev(query);
  }
  @Post('icing-sld')
  icingSld(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryIcingSld(query);
  }
}
