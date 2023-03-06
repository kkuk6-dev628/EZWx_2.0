import { RouteModule } from './route/route.module';
import { StationTimeModule } from './station-time/station-time.module';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ApiController],
  imports: [StationTimeModule, RouteModule],
  providers: [ApiService],
})
export class ApiModule {}
