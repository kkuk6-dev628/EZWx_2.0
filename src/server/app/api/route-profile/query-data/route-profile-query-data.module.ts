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
  NbmCloudbase,
  NbmCloudceiling,
  NbmDewpoint,
  NbmGust,
  NbmSkycover,
  NbmT2m,
  NbmVis,
  NbmWindDirection,
  NbmWindSpeed,
  NbmWx1,
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
    TypeOrmModule.forFeature([NbmCloudbase], 'gisDB'),
    TypeOrmModule.forFeature([NbmCloudceiling], 'gisDB'),
    TypeOrmModule.forFeature([NbmDewpoint], 'gisDB'),
    TypeOrmModule.forFeature([NbmGust], 'gisDB'),
    TypeOrmModule.forFeature([NbmSkycover], 'gisDB'),
    TypeOrmModule.forFeature([NbmT2m], 'gisDB'),
    TypeOrmModule.forFeature([NbmVis], 'gisDB'),
    TypeOrmModule.forFeature([NbmWindDirection], 'gisDB'),
    TypeOrmModule.forFeature([NbmWindSpeed], 'gisDB'),
    TypeOrmModule.forFeature([NbmWx1], 'gisDB'),
  ],
  controllers: [RouteProfileQueryDataController],
  providers: [RouteProfileQueryDataService],
})
export class RouteProfileQueryDataModule {}
