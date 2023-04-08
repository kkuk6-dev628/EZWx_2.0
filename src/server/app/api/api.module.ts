import { LayerControlModule } from './layer-control/layer-control.module';
import { RouteModule } from './route/route.module';
import { StationTimeModule } from './station-time/station-time.module';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { Module } from '@nestjs/common';
import { RouteProfileModule } from './route-profile/route-profile.module';

@Module({
  controllers: [ApiController],
  imports: [StationTimeModule, RouteModule, LayerControlModule, RouteProfileModule],
  providers: [ApiService],
})
export class ApiModule {}
