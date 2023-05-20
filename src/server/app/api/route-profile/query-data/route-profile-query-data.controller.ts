import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
  @Post('g-winddirection')
  gfsWindDirection(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryGfsWindDirection(query);
  }
  @Post('g-windspeed')
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
  @Post('n-cloudbase')
  nbmCloudbase(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmCloudbase(query);
  }
  @Post('nbm-cloudceiling')
  nbmCloudceiling(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmCloudceiling(query);
  }
  @Post('n-dewpoint')
  nbmDewpoint(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmDewpoint(query);
  }
  @Post('n-gust')
  nbmGust(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmGust(query);
  }
  @Post('n-skycover')
  nbmSkycover(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmSkycover(query);
  }
  @Post('n-t2m')
  nbmT2m(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmT2m(query);
  }
  @Post('n-vis')
  nbmVis(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmVis(query);
  }
  @Post('n-winddirection')
  nbmWindDirection(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmWindDirection(query);
  }
  @Post('n-windspeed')
  nbmWindSpeed(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmWindSpeed(query);
  }
  @Post('n-wx-1')
  nbmWx1(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryNbmWx1(query);
  }
  @Post('n-all')
  nbmAll(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryAllNbmValues(query);
  }
  @Post('n-ceiling-vis')
  nbmCeilingVisibility(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryCeilingVisibility(query);
  }
  @Get('airport-nbm')
  airportNbm(@Query() query: { faaids: string }) {
    return this.routeProfileQueryDataService.queryAirportNbm(query);
  }
}
