import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { RoutePoint } from './route-point.entity';

@Entity()
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  departure: string;

  @Column()
  destination: string;

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

  @OneToMany(() => RoutePoint, (routePoint) => routePoint.route, {
    onDelete: 'CASCADE',
  })
  routeOfFlight: RoutePoint[];

  @ManyToOne(() => User, (user) => user.routes)
  user: User;
}
