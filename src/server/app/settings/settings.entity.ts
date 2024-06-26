import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoutePoint } from '../api/route/route-point.entity';
import { Route } from '../api/route/route.entity';
@Entity()
export class UserSettings {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'bigint' })
  observation_time: string;
  @Column()
  observation_interval: number;
  @Column()
  default_home_airport: string;
  @Column()
  default_temperature_unit: boolean;
  @Column()
  default_time_display_unit: boolean;
  @Column()
  default_wind_speed_unit: boolean;
  @Column()
  default_distance_unit: boolean;
  @Column()
  default_visibility_unit: boolean;
  @Column({ default: null, nullable: true })
  landing_page: string;

  //AirCraft Setting Fields
  @Column()
  max_takeoff_weight_category: string;
  @Column()
  true_airspeed: number;

  //Personal Minimums Fields

  @Column()
  ceiling_at_departure_min: number;
  @Column()
  ceiling_at_departure_max: number;

  @Column({ type: 'decimal' })
  surface_visibility_at_departure_min: number;
  @Column({ type: 'decimal' })
  surface_visibility_at_departure_max: number;

  @Column()
  crosswinds_at_departure_airport_min: number;
  @Column()
  crosswinds_at_departure_airport_max: number;

  @Column()
  ceiling_along_route_min: number;
  @Column()
  ceiling_along_route_max: number;

  @Column({ type: 'decimal' })
  surface_visibility_along_route_min: number;
  @Column({ type: 'decimal' })
  surface_visibility_along_route_max: number;

  @Column()
  en_route_icing_probability_min: number;
  @Column()
  en_route_icing_probability_max: number;
  @Column()
  en_route_icing_intensity_min: number;
  @Column()
  en_route_icing_intensity_max: number;

  @Column()
  en_route_turbulence_intensity_min: number;

  @Column()
  en_route_turbulence_intensity_max: number;

  @Column()
  en_route_convective_potential_min: number;
  @Column()
  en_route_convective_potential_max: number;

  @Column()
  ceiling_at_destination_min: number;
  @Column()
  ceiling_at_destination_max: number;

  @Column({ type: 'decimal' })
  surface_visibility_at_destination_min: number;
  @Column({ type: 'decimal' })
  surface_visibility_at_destination_max: number;

  @Column()
  crosswinds_at_destination_airport_min: number;
  @Column()
  crosswinds_at_destination_airport_max: number;

  @Column({ unique: true })
  user_id: number;

  @OneToOne(() => Route)
  @JoinColumn()
  active_route: Route;
}
