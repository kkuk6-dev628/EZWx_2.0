import { Route } from './route.entity';
import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async findAll(params: FindManyOptions<Route> = {}) {
    const routes = await this.routeRepository.find(params);
    return routes;
  }
}
