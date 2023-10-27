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
  NbmWx2,
  NbmWxInten1,
  NbmWxInten2,
  NbmWxProbCov1,
  NbmWxProbCov2,
} from './route-profile.gisdb-entity';
import { RouteProfileQueryDataController } from './route-profile-query-data.controller';
import { RouteProfileQueryDataService } from './route-profile-query-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        ClearAirTurb,
        Mwturb,
        GfsHumidity,
        GfsTemperature,
        GfsWindDirection,
        GfsWindSpeed,
        IcingProb,
        IcingSev,
        IcingSld,
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
        NbmWx2,
        NbmWxInten1,
        NbmWxInten2,
        NbmWxProbCov1,
        NbmWxProbCov2,
      ],
      'gisDB',
    ),
  ],
  controllers: [RouteProfileQueryDataController],
  providers: [RouteProfileQueryDataService],
})
export class RouteProfileQueryDataModule {}
