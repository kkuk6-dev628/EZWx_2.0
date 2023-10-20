import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RecentAirport } from './recent-airport.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
@Injectable()
export class AirportwxService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(RecentAirport)
    private recentAirportRepository: Repository<RecentAirport>,
  ) {}

  async getRecentAirport(user: User) {
    const res = await this.recentAirportRepository.find({
      where: {
        userId: user.id,
      },
    });
    return res;
  }

  async addRecentAirport(recentAirport) {
    return (await this.recentAirportRepository.upsert(recentAirport, ['userId'])).generatedMaps[0].id;
  }
}
