import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';

@Controller('api/favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/get-favitems')
  getFavoritesItems(@Request() request) {
    return this.favoritesService.getFavoritesItems(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update-favitem')
  updateFavoritesItem(@Request() request, @Body() favitem) {
    favitem.userId = request.user.id;
    favitem.updated_at = undefined;
    favitem.created_at = undefined;
    return this.favoritesService.updateFavoritesItem(favitem);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get-favorder')
  getFavoritesOrder(@Request() request) {
    return this.favoritesService.getFavoritesOrder(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update-favitem')
  updateFavoritesOrder(@Request() request, @Body() favorder) {
    favorder.userId = request.user.id;
    favorder.updated_at = undefined;
    favorder.created_at = undefined;
    return this.favoritesService.updateFavoritesOrder(favorder);
  }
}
