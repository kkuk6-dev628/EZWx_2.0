import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RecentAirport } from './recent-airport.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { AirportwxState } from './airportwx-state.entity';
import { Afd, CountyWarningAreas, Metar, Taf } from './airportwx.gisdb-entity';
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
    @InjectDataSource('gisDB')
    private dataSource: DataSource,
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

  async getAfdText(lon: number, lat: number) {
    const res = await this.dataSource
      .createQueryBuilder()
      .select('afd.afd_content')
      .from(Afd, 'afd')
      .leftJoin(CountyWarningAreas, 'cwa', 'cwa.wfo=afd.afd_name')
      .where('ST_Intersects(ST_SetSRID(ST_POINT(:lon, :lat), 4326), cwa.geom)', { lon, lat })
      .getOne();
    return res;
  }

  async getAllAirports() {
    const res = await this.dataSource.query(
      'select icaoid, faaid, name, ST_X(geometry) as lng, ST_Y(geometry) as lat from airport',
    );
    return res;
  }

  //name,city,state,country,wkb_geometry
  async getAllWaypoints() {
    const res = await this.dataSource.query(
      'select name, city, state, country, ST_X(wkb_geometry) as lng, ST_Y(wkb_geometry) as lat from waypoint',
    );
    return res;
  }
}
