import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  default_home_airport: string;
  @Column()
  default_temperature_unit: string;
  @Column()
  default_time_display_unit: string;
  @Column()
  default_wind_speed_unit: string;
  @Column()
  default_distance_unit: string;
  @Column()
  default_visibility_unit: string;

  //AirCraft Setting Fields
  @Column()
  max_takeoff_weight_category: string;
  @Column()
  true_airspeed: number;

  //Personal Minimums Fields

  @Column()
  ceiling_at_departure: number;

  @Column()
  surface_visibility_at_departure: number;

  @Column()
  crosswinds_at_departure_airport: number;

  @Column()
  ceiling_along_route: number;

  @Column()
  surface_visibility_along_route: number;

  @Column()
  en_route_icing_probability: number;

  @Column()
  en_route_turbulence_intensity: number;

  @Column()
  en_route_convective_potential: number;

  @Column()
  ceiling_at_destination: number;

  @Column()
  surface_visibility_at_destination: number;

  @Column()
  crosswinds_at_destination_airport: number;
}
