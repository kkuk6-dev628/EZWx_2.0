import { Injectable } from '@nestjs/common';
import { StationTime } from './station-time.gisdb-entity';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class StationTimeService {
  constructor(
    @InjectRepository(StationTime, 'gisDB')
    private stationTimeRepository: Repository<StationTime>,
  ) {}

  async findAll(params: FindManyOptions<StationTime> = {}) {
    const stationTimes = await this.stationTimeRepository.find(params);
    return stationTimes;
  }
}
