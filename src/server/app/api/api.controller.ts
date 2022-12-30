import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ApiService } from './api.service';
import { RoutePointsDto } from './dto';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}
  @Post('/asd')
  async api(@Body() routePointsDto: RoutePointsDto) {
    return this.apiService.queryRaster(routePointsDto);
  }
}
