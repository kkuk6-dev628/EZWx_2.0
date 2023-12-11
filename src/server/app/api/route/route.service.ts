/* eslint-disable @typescript-eslint/ban-ts-comment */
import { RouteOfFlight } from './route-of-flight.entity';
import { CreateRouteDto, CreateRoutePointDto } from './dto/route.dto';
import { Route } from './route.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/user.entity';
import { RoutePoint } from './route-point.entity';
import { UserSettings } from '../../settings/settings.entity';
@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(RoutePoint)
    private routePointRepository: Repository<RoutePoint>,
    @InjectRepository(RouteOfFlight)
    private routeFlightRepository: Repository<RouteOfFlight>,
    @InjectRepository(UserSettings)
    private userSettingsRepository: Repository<UserSettings>,
  ) {}

  async find(user: User) {
    try {
      const res = await this.routeRepository.find({
        where: {
          user: user as any,
        },
        order: {
          updated_at: 'DESC',
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
      // res.forEach((route) => {
      //   const routeOfFlight = route.routeOfFlight
      //     .sort((a, b) => (a.order > b.order ? 1 : -1))
      //     .map((item: RouteOfFlight) => item.routePoint);
      //   //@ts-ignore
      //   route.routeOfFlight = routeOfFlight;
      // });
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
    if (route.id) {
      const updateRoute = await this.routeRepository.preload(route);
      if (updateRoute) {
        updateRoute.departure = await this.selectOrInsertRoutePoint(route.departure);
        updateRoute.destination = await this.selectOrInsertRoutePoint(route.destination);
        const routeOfFlights = [];
        this.routeFlightRepository.delete({ routeId: route.id });
        for (let i = 0; i < route.routeOfFlight.length; i++) {
          const updateRouteOfFlight = new RouteOfFlight();
          const routePoint = await this.selectOrInsertRoutePoint(route.routeOfFlight[i].routePoint);
          updateRouteOfFlight.routePointId = routePoint.id;
          updateRouteOfFlight.routeId = route.id;
          updateRouteOfFlight.order = i;
          updateRouteOfFlight.routePoint = routePoint;
          const saved = await this.routeFlightRepository.save(updateRouteOfFlight);
          routeOfFlights.push(saved);
        }
        updateRoute.routeOfFlight = routeOfFlights;
        const userSettings = await this.userSettingsRepository.findOneBy({ user_id: user.id });
        userSettings.active_route = updateRoute;
        this.userSettingsRepository.save(userSettings);
        await this.routeRepository.save(updateRoute);
        return updateRoute;
      }
    }
    const routeEntity = new Route();
    routeEntity.useForecastWinds = route.useForecastWinds;
    routeEntity.altitude = route.altitude;
    routeEntity.routeOfFlight = [];
    routeEntity.user = user;
    routeEntity.departure = await this.selectOrInsertRoutePoint(route.departure);
    routeEntity.destination = await this.selectOrInsertRoutePoint(route.destination);
    const res = await this.routeRepository.save(routeEntity);
    // const oldRows = await this.routeRepository.find({
    //   select: ['id'],
    //   where: {
    //     user: routeEntity.user,
    //   },
    //   order: {
    //     updated_at: 'DESC',
    //   },
    //   skip: 10,
    // });
    // if (oldRows.length > 0) {
    //   this.routeRepository.delete(oldRows.map((x) => x.id));
    // }

    const routeOfFlights = [];
    for (let i = 0; i < route.routeOfFlight.length; i++) {
      const routePoint = await this.selectOrInsertRoutePoint(route.routeOfFlight[i].routePoint);
      const routeOfFlight = this.routeFlightRepository.create({
        order: i,
        route: routeEntity,
        routePoint: routePoint,
      });
      const saved = await this.routeFlightRepository.save(routeOfFlight);
      routeOfFlights.push(saved);
    }
    routeEntity.routeOfFlight = routeOfFlights;
    res.routeOfFlight = routeOfFlights;
    const userSettings = await this.userSettingsRepository.findOneBy({ user_id: user.id });
    userSettings.active_route = res;
    this.userSettingsRepository.save(userSettings);
    this.cleanRoutes(user);
    return res;
  }

  async delete(user: User, id: number) {
    const deleteRoute = await this.routeRepository.findOneBy({ id });
    this.routeRepository.softRemove(deleteRoute);
    const userSettings = await this.userSettingsRepository.findOneBy({ user_id: user.id });
    userSettings.active_route = null;
    this.userSettingsRepository.save(userSettings);
    return deleteRoute;
  }

  async cleanRoutes(user: User) {
    const ids = await this.routeRepository.find({
      select: ['id'],
      where: {
        user: user,
      },
      order: {
        updated_at: 'DESC',
      },
      skip: 10,
    });
    ids.forEach((x) => this.delete(user, x.id));
  }
}
