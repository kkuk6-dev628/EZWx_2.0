import { JwtAuthGuard } from './../../auth/jwt/jwt-auth.guard';
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { RouteProfileService } from './route-profile.service';

@Controller('api/route-profile')
export class RouteProfileController {
  constructor(private routeProfileService: RouteProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  find(@Request() request) {
    return this.routeProfileService.getRouteProfileState(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  update(@Request() request, @Body() routeProfileState) {
    routeProfileState.userId = request.user.id;
    routeProfileState.id = undefined;
    routeProfileState.updated_at = undefined;
    routeProfileState.created_at = undefined;
    return this.routeProfileService.updateRouteProfileState(routeProfileState);
  }
}
