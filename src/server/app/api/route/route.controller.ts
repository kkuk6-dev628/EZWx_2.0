import { CreateRouteDto } from './dto/route.dto';
import { JwtAuthGuard } from './../../auth/jwt/jwt-auth.guard';
import { Body, Controller, Get, Post, Request, UseGuards, Delete, Param } from '@nestjs/common';
import { RouteService } from './route.service';

@Controller('api/route')
export class RouteController {
  constructor(private routeService: RouteService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  find(@Request() request) {
    return this.routeService.find(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  route(@Request() request, @Body() createRouteDto: CreateRouteDto) {
    return this.routeService.route(request.user, createRouteDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Request() request, @Param('id') id: number) {
    return this.routeService.delete(request.user, id);
  }
}
