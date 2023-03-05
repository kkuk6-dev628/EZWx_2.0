import { Controller, Get } from '@nestjs/common';
import { RouteService } from './route.service';

@Controller('api/route')
export class RouteController {
  constructor(private routeService: RouteService) {}

  @Get('findAll')
  findAll() {
    return this.routeService.findAll({});
  }
}
