import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { RoutePoint } from './route-point.entity';
import { Route } from './route.entity';

@Entity()
export class RouteOfFlight {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Column()
  public routeId: number;

  @Index()
  @Column()
  public routePointId: number;

  @Column()
  public order: number;

  @ManyToOne(() => Route, (route) => route.routeOfFlight)
  public route: Route;

  @ManyToOne(() => RoutePoint, (routePoint) => routePoint.routeOfFlights)
  public routePoint: RoutePoint;
}
