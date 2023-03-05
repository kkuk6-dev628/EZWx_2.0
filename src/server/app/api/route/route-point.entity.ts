import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Route } from './route.entity';

@Entity('route_points')
export class RoutePoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column()
  type: string;

  @Column()
  order: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Route, (route) => route.routeOfFlight, {
    onDelete: 'CASCADE',
  })
  route: Route;
}
