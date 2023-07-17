import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RouteProfileQueryDataService } from './route-profile-query-data.service';
import { RouteProfileQueryDto, RouteSegmentsDto } from './route-profile-query.dto';

@Controller('api/route-profile/data')
export class RouteProfileQueryDataController {
  constructor(private routeProfileQueryDataService: RouteProfileQueryDataService) {}

  @Post('d-advisor')
  query4DepartureAdvisor(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.query4DepartureAdvisor(query);
  }

  @Get('airport-nbm')
  airportNbm(@Query() query: { faaids: string }) {
    return this.routeProfileQueryDataService.queryAirportNbm(query);
  }
  @Post('g-data')
  queryGfsData(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryGfsData(query);
  }
  @Post('n-data')
  queryNbmAll(@Body() query: RouteProfileQueryDto) {
    return this.routeProfileQueryDataService.queryAllNbmValues(query);
  }
}
