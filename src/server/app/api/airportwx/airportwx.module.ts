import { Module } from '@nestjs/common';
import { AirportwxController } from './airportwx.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecentAirport } from './recent-airport.entity';
import { AirportwxService } from './airportwx.service';
import { AirportwxState } from './airportwx-state.entity';
import { Afd, Metar, Taf } from './airportwx.gisdb-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecentAirport, AirportwxState]),
    TypeOrmModule.forFeature([Metar, Taf, Afd], 'gisDB'),
    HttpModule,
  ],
  controllers: [AirportwxController],
  providers: [AirportwxService],
})
export class AirportwxModule {}
