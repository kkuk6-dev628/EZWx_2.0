import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class UserSettings {
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
  ceiling_at_departure_min: number;
  @Column()
  ceiling_at_departure_max: number;

  @Column()
  surface_visibility_at_departure_min: number;
  @Column()
  surface_visibility_at_departure_max: number;

  @Column()
  crosswinds_at_departure_airport_min: number;
  @Column()
  crosswinds_at_departure_airport_max: number;

  @Column()
  ceiling_along_route_min: number;
  @Column()
  ceiling_along_route_max: number;

  @Column()
  surface_visibility_along_route_min: number;
  @Column()
  surface_visibility_along_route_max: number;

  @Column()
  en_route_icing_probability_min: string;
  @Column()
  en_route_icing_probability_max: string;

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

  @Column()
  surface_visibility_at_destination_min: number;
  @Column()
  surface_visibility_at_destination_max: number;

  @Column()
  crosswinds_at_destination_airport_min: number;
  @Column()
  crosswinds_at_destination_airport_max: number;

  @Column()
  user_id: number;
}
