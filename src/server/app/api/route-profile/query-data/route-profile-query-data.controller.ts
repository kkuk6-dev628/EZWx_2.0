import { Body, Controller, Request, Get, Post, UseGuards, Query } from '@nestjs/common';
import { RouteProfileQueryDataService } from './route-profile-query-data.service';
import { RouteProfileQueryDto } from './route-profile-query.dto';
import { JwtAuthGuard } from 'src/server/app/auth/jwt/jwt-auth.guard';

@Controller('api/route-profile/data')
export class RouteProfileQueryDataController {
  constructor(private routeProfileQueryDataService: RouteProfileQueryDataService) {}

  @Post('d-advisor')
  query4DepartureAdvisor(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.query4DepartureAdvisor(query);
  }

  @Post('airport-nbm')
  airportNbm(@Body() query: { faaids: string[] }) {
    return this.routeProfileQueryDataService.queryAirportNbm(query.faaids);
  }
  @Post('g-data')
  queryGfsData(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryGfsData(query);
  }
  @Post('n-data')
  queryNbmAll(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryAllNbmValues(query);
  }
  @Post('it-data')
  queryIcingTurb(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryIcingTurbData(query);
  }
  @UseGuards(JwtAuthGuard)
  @Get('last-dep-time')
  queryLastDepartureDataTime() {
    return this.routeProfileQueryDataService.queryLastDepartureDataTime();
  }
  @Get('mgram')
  queryMeteogramData(@Query() { lat, lng }: { lat: number; lng: number }) {
    const queryPoints = [[lng, lat]];
    return this.routeProfileQueryDataService.queryMeteogramData({
      queryPoints,
      elevations: [],
    });
  }
}
