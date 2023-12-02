import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteItem, FavoritesOrder } from './favorites.entity';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteItem, FavoritesOrder])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
