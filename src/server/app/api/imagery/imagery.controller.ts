import { Body, Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { ImageryService } from './imagery.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';

@Controller('api/imagery')
export class ImageryController {
  constructor(private imageryService: ImageryService) {}

  @Get('timestamps')
  getTimeStamp(@Query() query) {
    return this.imageryService.getTimeStamp(query.url);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recents')
  getRecentImageries(@Request() request) {
    return this.imageryService.getRecentImageries(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-recent')
  update(@Request() request, @Body() imageryState) {
    imageryState.userId = request.user.id;
    imageryState.id = undefined;
    imageryState.updated_at = undefined;
    imageryState.created_at = undefined;
    return this.imageryService.addRecentImagery(imageryState, request.user);
  }
}
