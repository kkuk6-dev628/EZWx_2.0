import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ClearAirTurb,
  GfsHumidity,
  GfsTemperature,
  GfsWindDirection,
  GfsWindSpeed,
  IcingProb,
  IcingSev,
  IcingSld,
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
    TypeOrmModule.forFeature([IcingProb], 'gisDB'),
    TypeOrmModule.forFeature([IcingSev], 'gisDB'),
    TypeOrmModule.forFeature([IcingSld], 'gisDB'),
  ],
  controllers: [RouteProfileQueryDataController],
  providers: [RouteProfileQueryDataService],
})
export class RouteProfileQueryDataModule {}
