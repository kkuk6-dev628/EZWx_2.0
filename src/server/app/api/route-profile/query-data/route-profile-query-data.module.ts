import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClearAirTurb } from './route-profile.gisdb-entity';
import { RouteProfileQueryDataController } from './route-profile-query-data.controller';
import { RouteProfileQueryDataService } from './route-profile-query-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClearAirTurb], 'gisDB')],
  controllers: [RouteProfileQueryDataController],
  providers: [RouteProfileQueryDataService],
})
export class RouteProfileQueryDataModule {}
