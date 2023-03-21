import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RouteOfFlight } from './route-of-flight.entity';
import { Route } from './route.entity';

@Entity('route_points')
@Index(['key', 'type'])
export class RoutePoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column({
    transformer: {
      from: (value: string) => JSON.parse(value),
      to: (value: any) => JSON.stringify(value),
    },
  })
  position: string;

  @OneToMany(() => Route, (route) => route.departure, {
    onDelete: 'CASCADE',
  })
  departures: Route[];

  @OneToMany(() => Route, (route) => route.destination, {
    onDelete: 'CASCADE',
  })
  destinations: Route[];

  @OneToMany(() => RouteOfFlight, (routeOfFlight) => routeOfFlight.routePoint, {
    onDelete: 'CASCADE',
  })
  routeOfFlights: RouteOfFlight[];
}
