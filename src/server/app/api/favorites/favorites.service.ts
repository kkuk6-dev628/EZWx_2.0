import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoriteItem, FavoritesOrder as FavoritesOrder } from './favorites.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoritesOrder)
    private favoritesOrderRepository: Repository<FavoritesOrder>,
    @InjectRepository(FavoriteItem)
    private favoritesItemRepository: Repository<FavoriteItem>,
  ) {}

  async getFavoritesItems(userId) {
    return await this.favoritesItemRepository.find({
      where: [{ id: 1 }, { userId: userId }],
      order: {
        id: 'ASC',
      },
    });
  }

  async getFavoritesOrder(userId) {
    return await this.favoritesOrderRepository.findOne({ where: { userId } });
  }

  async updateFavoritesItem(favitem) {
    if (favitem.id) {
      this.favoritesItemRepository.update(favitem.id, favitem);
    } else {
      this.favoritesItemRepository.insert(favitem);
    }
  }

  async updateFavoritesOrder(favorder) {
    this.favoritesOrderRepository.update(favorder.id, favorder);
  }
}
