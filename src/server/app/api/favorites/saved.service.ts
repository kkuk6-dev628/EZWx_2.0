import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SavedItem, SavedOrder as SavedOrder } from './saved.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(SavedOrder)
    private savedOrderRepository: Repository<SavedOrder>,
    @InjectRepository(SavedItem)
    private savedItemRepository: Repository<SavedItem>,
  ) {}

  async getSavedItems(userId) {
    return await this.savedItemRepository.find({
      where: [{ id: 1 }, { userId: userId }],
      order: {
        id: 'ASC',
      },
    });
  }

  async getSavedOrder(userId) {
    return await this.savedOrderRepository.findOne({ where: { userId } });
  }

  async updateSavedItem(saveditem) {
    if (saveditem.id) {
      return await this.savedItemRepository.update(saveditem.id, saveditem);
    } else {
      return await this.savedItemRepository.insert(saveditem);
    }
  }

  async deleteSavedItem(saveditem) {
    const deletedChildren = (await this.savedItemRepository.delete({ parent: saveditem.id })).affected;
    const deleted = (await this.savedItemRepository.delete(saveditem.id)).affected;
    return { deletedChildren, deleted };
  }

  async updateSavedOrder(savedorder) {
    if (savedorder.id) {
      return await this.savedOrderRepository.update(savedorder.id, savedorder);
    }
    return await this.savedOrderRepository.insert(savedorder);
  }
}
