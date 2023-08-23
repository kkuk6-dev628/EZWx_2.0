import { RouteOfFlight } from './route-of-flight.entity';
import { RoutePoint } from './route-point.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './route.entity';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { UserSettings } from '../../settings/settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Route]),
    TypeOrmModule.forFeature([RoutePoint]),
    TypeOrmModule.forFeature([RouteOfFlight]),
    TypeOrmModule.forFeature([UserSettings]),
  ],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
