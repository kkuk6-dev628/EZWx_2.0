import { Body, Controller, Post } from '@nestjs/common';
import { RouteProfileQueryDataService } from './route-profile-query-data.service';
import { RouteProfileQueryDto, RouteSegmentsDto } from './route-profile-query.dto';

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
  @Post('nbm-cloudbase')
  nbmCloudbase(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmCloudbase(query);
  }
  @Post('nbm-cloudceiling')
  nbmCloudceiling(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmCloudceiling(query);
  }
  @Post('nbm-dewpoint')
  nbmDewpoint(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmDewpoint(query);
  }
  @Post('nbm-gust')
  nbmGust(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmGust(query);
  }
  @Post('nbm-skycover')
  nbmSkycover(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmSkycover(query);
  }
  @Post('nbm-t2m')
  nbmT2m(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmT2m(query);
  }
  @Post('nbm-vis')
  nbmVis(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmVis(query);
  }
  @Post('nbm-winddirection')
  nbmWindDirection(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmWindDirection(query);
  }
  @Post('nbm-windspeed')
  nbmWindSpeed(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmWindSpeed(query);
  }
  @Post('nbm-wx-1')
  nbmWx1(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmWindSpeed(query);
  }
  @Post('nbm-all')
  nbmAll(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryAllNbmValues(query);
  }
}
