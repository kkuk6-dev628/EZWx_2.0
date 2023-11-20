import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RecentAirport } from './recent-airport.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { AirportwxState } from './airportwx-state.entity';
import { Metar, Taf } from './airportwx.gisdb-entity';
@Injectable()
export class AirportwxService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(RecentAirport)
    private recentAirportRepository: Repository<RecentAirport>,
    @InjectRepository(AirportwxState)
    private airportwxStateRepository: Repository<AirportwxState>,
    @InjectRepository(Metar, 'gisDB')
    private metarRepository: Repository<Metar>,
    @InjectRepository(Taf, 'gisDB')
    private tafRepository: Repository<Taf>,
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

  async getMetarText(icaoid: string) {
    const res = await this.metarRepository
      .createQueryBuilder()
      .where({ station_id: Like(`%${icaoid}`) })
      .distinctOn(['observation_time'])
      .orderBy({ observation_time: 'DESC' })
      .getMany();
    return res;
  }

  async getTafText(icaoid: string) {
    const res = await this.tafRepository
      .createQueryBuilder()
      .where({ station_id: Like(`%${icaoid}`) })
      .distinctOn(['issue_time'])
      .orderBy({ issue_time: 'DESC' })
      .getMany();
    return res;
  }
}
