import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { RouteProfile } from './route-profile.entity';

@Injectable()
export class RouteProfileService {
  constructor(
    @InjectRepository(RouteProfile)
    private routeProfileRepository: Repository<RouteProfile>,
  ) {}

  async getRouteProfileState(user: User) {
    const res = await this.routeProfileRepository.findOne({
      where: {
        userId: user.id,
      },
    });
    return res;
  }

  async updateRouteProfileState(routeProfileState) {
    return (await this.routeProfileRepository.upsert(routeProfileState, ['userId'])).generatedMaps[0].id;
  }
}
