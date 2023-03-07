import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinTable,
  ManyToMany,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { RouteOfFlight } from './route-of-flight.entity';
import { RoutePoint } from './route-point.entity';

@Entity()
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  altitude: number;

  @Column()
  useForecastWinds: boolean;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @OneToMany(() => RouteOfFlight, (routeOfFlight) => routeOfFlight.route, {
    onDelete: 'CASCADE',
  })
  routeOfFlight: RouteOfFlight[];

  @ManyToOne(() => RoutePoint, (routePoint) => routePoint.destinations)
  destination: RoutePoint;

  @ManyToOne(() => RoutePoint, (routePoint) => routePoint.departures)
  departure: RoutePoint;

  @ManyToOne(() => User, (user) => user.routes)
  user: User;
}
