import { Body, Controller, Get, Post, UseGuards, Request, Param } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get('/get-airportwx-state')
  getAirportwxState(@Request() request) {
    return this.airportwxService.getAirportwxState(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update-airportwx-state')
  updateAirportwxState(@Request() request, @Body() airportwxState) {
    airportwxState.userId = request.user.id;
    airportwxState.id = undefined;
    airportwxState.updated_at = undefined;
    airportwxState.created_at = undefined;
    return this.airportwxService.updateAirportwxState(airportwxState);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:icaoid/metar')
  getMetarText(@Param('icaoid') icaoid) {
    return this.airportwxService.getMetarText(icaoid);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:icaoid/taf')
  getTafText(@Param('icaoid') icaoid) {
    return this.airportwxService.getTafText(icaoid);
  }
}
