/* eslint-disable @typescript-eslint/ban-ts-comment */
import { RouteOfFlight } from './route-of-flight.entity';
import { CreateRouteDto, CreateRoutePointDto } from './dto/route.dto';
import { Route } from './route.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/user.entity';
import { RoutePoint } from './route-point.entity';
@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(RoutePoint)
    private routePointRepository: Repository<RoutePoint>,
    @InjectRepository(RouteOfFlight)
    private routeFlightRepository: Repository<RouteOfFlight>,
  ) {}

  async find(user: User) {
    try {
      const res = await this.routeRepository.find({
        where: {
          user: user as any,
        },
        order: {
          created_at: 'DESC',
        },
        take: 5,
        relations: {
          routeOfFlight: {
            routePoint: true,
          },
          destination: true,
          departure: true,
        },
      });
      res.forEach((route) => {
        const routeOfFlight = route.routeOfFlight
          .sort((a, b) => (a.order > b.order ? 1 : -1))
          .map((item: RouteOfFlight) => item.routePoint);
        //@ts-ignore
        route.routeOfFlight = routeOfFlight;
      });
      return res;
    } catch (e) {
      console.log('Error in find route', e);
    }
  }

  async selectOrInsertRoutePoint(routePointDto: CreateRoutePointDto): Promise<RoutePoint> {
    let routePoint = await this.routePointRepository.findOneBy({
      key: routePointDto.key,
      type: routePointDto.type,
    });

    if (!routePoint) {
      routePoint = this.routePointRepository.create(routePointDto);
      await this.routePointRepository.save(routePoint);
    }
    return routePoint;
  }

  async route(user: User, route: CreateRouteDto) {
    //@ts-ignore
    const routeEntity = this.routeRepository.create(route);
    routeEntity.routeOfFlight = [];
    routeEntity.user = user;
    routeEntity.departure = await this.selectOrInsertRoutePoint(route.departure);
    routeEntity.destination = await this.selectOrInsertRoutePoint(route.destination);
    await this.routeRepository.save(routeEntity);

    const routeOfFlights = [];
    for (let i = 0; i < route.routeOfFlight.length; i++) {
      const routePoint = await this.selectOrInsertRoutePoint(route.routeOfFlight[i]);
      const routeOfFlight = this.routeFlightRepository.create({
        order: i,
        route: routeEntity,
        routePoint: routePoint,
      });
      this.routeFlightRepository.save(routeOfFlight);
      routeOfFlights.push(routeOfFlight);
    }
    routeEntity.routeOfFlight = routeOfFlights;
    return routeEntity;
  }
}
