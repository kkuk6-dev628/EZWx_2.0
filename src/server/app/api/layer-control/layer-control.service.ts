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
    // if (layerControlState.userId) {
    //   await this.layerControlRepository.update({ id: layerControlState.id }, layerControlState);
    //   return layerControlState.id;
    // }
    const result = (await this.layerControlRepository.upsert(layerControlState, ['userId'])).generatedMaps[0];
    return { ...layerControlState, id: result.id };
  }

  async getBaseLayerControlState(user: User) {
    return await this.baseLayerControlRepository.findOne({
      where: {
        userId: user.id,
      },
    });
  }

  async updateBaseLayerControlState(baseLayerControlState) {
    // if (baseLayerControlState.id) {
    //   await this.baseLayerControlRepository.update({ id: baseLayerControlState.id }, baseLayerControlState);
    //   return baseLayerControlState.id;
    // }
    const result = (await this.baseLayerControlRepository.upsert(baseLayerControlState, ['userId'])).generatedMaps[0];
    return { ...baseLayerControlState, id: result.id };
  }
}
