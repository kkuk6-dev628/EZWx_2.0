import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ClearAirTurb,
  GfsHumidity,
  GfsTemperature,
  GfsWindDirection,
  GfsWindSpeed,
  Mwturb,
} from './route-profile.gisdb-entity';
import { RouteProfileQueryDataController } from './route-profile-query-data.controller';
import { RouteProfileQueryDataService } from './route-profile-query-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClearAirTurb], 'gisDB'),
    TypeOrmModule.forFeature([Mwturb], 'gisDB'),
    TypeOrmModule.forFeature([GfsHumidity], 'gisDB'),
    TypeOrmModule.forFeature([GfsTemperature], 'gisDB'),
    TypeOrmModule.forFeature([GfsWindDirection], 'gisDB'),
    TypeOrmModule.forFeature([GfsWindSpeed], 'gisDB'),
  ],
  controllers: [RouteProfileQueryDataController],
  providers: [RouteProfileQueryDataService],
})
export class RouteProfileQueryDataModule {}
