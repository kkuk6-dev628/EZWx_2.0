import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RouteProfile } from './route-profile.entity';
import { RouteProfileController } from './route-profile.controller';
import { RouteProfileService } from './route-profile.service';
import { RouteProfileQueryDataModule } from './query-data/route-profile-query-data.module';

@Module({
  imports: [TypeOrmModule.forFeature([RouteProfile]), RouteProfileQueryDataModule],
  controllers: [RouteProfileController],
  providers: [RouteProfileService],
})
export class RouteProfileModule {}
