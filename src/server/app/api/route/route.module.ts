import { gisdbConfig } from './../../../../../ormconfig';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './route.entity';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Route], 'gisDB')],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
