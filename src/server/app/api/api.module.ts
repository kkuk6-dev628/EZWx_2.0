import { LayerControlModule } from './layer-control/layer-control.module';
import { RouteModule } from './route/route.module';
import { StationTimeModule } from './station-time/station-time.module';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { Module } from '@nestjs/common';
import { RouteProfileModule } from './route-profile/route-profile.module';
import { ImageryModule } from './imagery/imagery.module';
import { AirportwxModule } from './airportwx/airportwx.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  controllers: [ApiController],
  imports: [
    StationTimeModule,
    RouteModule,
    LayerControlModule,
    RouteProfileModule,
    ImageryModule,
    AirportwxModule,
    FavoritesModule,
  ],
  providers: [ApiService],
})
export class ApiModule {}
