import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RouteProfile } from './route-profile.entity';
import { RouteProfileController } from './route-profile.controller';
import { RouteProfileService } from './route-profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([RouteProfile])],
  controllers: [RouteProfileController],
  providers: [RouteProfileService],
})
export class RouteProfileModule {}
