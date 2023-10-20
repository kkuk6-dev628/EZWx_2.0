import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AirportwxService } from './airportwx.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';

@Controller('api/airportwx')
export class AirportwxController {
  constructor(private airportwxService: AirportwxService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/get-recent')
  getRecentAirport(@Request() request) {
    return this.airportwxService.getRecentAirport(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/add-recent')
  addRecentAirport(@Request() request, @Body() recentAirport) {
    recentAirport.userId = request.user.id;
    recentAirport.id = undefined;
    recentAirport.updated_at = undefined;
    recentAirport.created_at = undefined;
    return this.airportwxService.addRecentAirport(recentAirport);
  }
}
