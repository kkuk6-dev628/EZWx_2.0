import { LayerControl } from './layer-control.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { BaseLayerControl } from './base-layer-control.entity';
import { LayerControlController } from './layer-control.controller';
import { LayerControlService } from './layer-control.service';

@Module({
  imports: [TypeOrmModule.forFeature([LayerControl, BaseLayerControl])],
  controllers: [LayerControlController],
  providers: [LayerControlService],
})
export class LayerControlModule {}
