import { HttpModule } from '@nestjs/axios';
import { ElevationsService } from './elevations.service';
import { Module } from '@nestjs/common';
import { ElevationsController } from './elevations.controller';

@Module({
  imports: [HttpModule],
  controllers: [ElevationsController],
  providers: [ElevationsService],
})
export class ElevationsModule {}
