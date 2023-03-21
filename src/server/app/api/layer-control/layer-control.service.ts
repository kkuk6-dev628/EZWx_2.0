import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { BaseLayerControl } from './base-layer-control.entity';
import { LayerControl } from './layer-control.entity';

@Injectable()
export class LayerControlService {
  constructor(
    @InjectRepository(LayerControl)
    private layerControlRepository: Repository<LayerControl>,
    @InjectRepository(BaseLayerControl)
    private baseLayerControlRepository: Repository<BaseLayerControl>,
  ) {}

  async getLayerControlState(user: User) {
    const res = await this.layerControlRepository.findOne({
      where: {
        userId: user.id,
      },
    });
    return res;
  }

  async updateLayerControlState(layerControlState) {
    if (layerControlState.id) {
      return await this.layerControlRepository.update({ id: layerControlState.id }, layerControlState);
    }
    return await this.layerControlRepository.insert(layerControlState);
  }

  async getBaseLayerControlState(user: User) {
    return await this.baseLayerControlRepository.findOne({
      where: {
        userId: user.id,
      },
    });
  }

  async updateBaseLayerControlState(baseLayerControlState) {
    if (baseLayerControlState.id) {
      return await this.baseLayerControlRepository.update({ id: baseLayerControlState.id }, baseLayerControlState);
    }
    return await this.baseLayerControlRepository.insert(baseLayerControlState);
  }
}
