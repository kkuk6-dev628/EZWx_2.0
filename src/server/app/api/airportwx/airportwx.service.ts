import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RecentAirport } from './recent-airport.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { AirportwxState } from './airportwx-state.entity';
@Injectable()
export class AirportwxService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(RecentAirport)
    private recentAirportRepository: Repository<RecentAirport>,
    @InjectRepository(AirportwxState)
    private airportwxStateRepository: Repository<AirportwxState>,
  ) {}

  async getRecentAirport(user: User) {
    const res = await this.recentAirportRepository.find({
      where: {
        userId: user.id,
      },
      order: {
        created_at: 'DESC',
      },
    });
    return res;
  }

  async addRecentAirport(recentAirport) {
    return (await this.recentAirportRepository.insert(recentAirport)).generatedMaps[0].id;
  }

  async getAirportwxState(user: User) {
    const res = await this.airportwxStateRepository.findOne({
      where: {
        userId: user.id,
      },
    });
    return res;
  }
  async updateAirportwxState(airportwxState) {
    return (await this.airportwxStateRepository.upsert(airportwxState, ['userId'])).generatedMaps[0].id;
  }
}
