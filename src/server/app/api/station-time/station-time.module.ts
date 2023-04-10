import { Module } from '@nestjs/common';
import { StationTimeController } from './station-time.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationTime } from './station-time.gisdb-entity';
import { StationTimeService } from './station-time.service';

@Module({
  imports: [TypeOrmModule.forFeature([StationTime], 'gisDB')],
  controllers: [StationTimeController],
  providers: [StationTimeService],
})
export class StationTimeModule {}
