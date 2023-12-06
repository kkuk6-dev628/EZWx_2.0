import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { SavedService } from './saved.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';

@Controller('api/saved')
export class SavedController {
  constructor(private savedService: SavedService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/get-saveditems')
  getSavedItems(@Request() request) {
    return this.savedService.getSavedItems(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update-saveditem')
  updateSavedItem(@Request() request, @Body() saveditem) {
    saveditem.userId = request.user.id;
    saveditem.selected = false;
    saveditem.updated_at = undefined;
    saveditem.created_at = undefined;
    return this.savedService.updateSavedItem(saveditem);
  }
  @UseGuards(JwtAuthGuard)
  @Post('/delete-saveditem')
  deleteSavedItem(@Body() saveditem) {
    return this.savedService.deleteSavedItem(saveditem);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get-savedorder')
  getSavedOrder(@Request() request) {
    return this.savedService.getSavedOrder(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update-savedorder')
  updateSavedOrder(@Request() request, @Body() savedorder) {
    savedorder.userId = request.user.id;
    savedorder.updated_at = undefined;
    savedorder.created_at = undefined;
    return this.savedService.updateSavedOrder(savedorder);
  }
}
