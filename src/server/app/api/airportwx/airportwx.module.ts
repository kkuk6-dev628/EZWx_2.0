import { Module } from '@nestjs/common';
import { AirportwxController } from './airportwx.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecentAirport } from './recent-airport.entity';
import { AirportwxService } from './airportwx.service';
import { AirportwxState } from './airportwx-state.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecentAirport, AirportwxState]), HttpModule],
  controllers: [AirportwxController],
  providers: [AirportwxService],
})
export class AirportwxModule {}
