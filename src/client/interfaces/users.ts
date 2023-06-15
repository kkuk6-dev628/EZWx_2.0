export interface authUser {
  email: string;
  id: string;
  displayName: string;
}

export type TakeoffWeightCategory = 'light' | 'medium' | 'heavy';

export interface UserSettings {
  user_id?: string;
  observation_time: number;
  observation_interval: number;
  default_home_airport: string;
  default_temperature_unit: boolean;
  default_time_display_unit: boolean;
  default_wind_speed_unit: boolean;
  default_distance_unit: boolean;
  default_visibility_unit: boolean;
  max_takeoff_weight_category: TakeoffWeightCategory;
  true_airspeed: number;
  ceiling_at_departure: [number, number];
  surface_visibility_at_departure: [number, number];
  crosswinds_at_departure_airport: [number, number];
  ceiling_along_route: [number, number];
  surface_visibility_along_route: [number, number];
  en_route_icing_probability: [number, number];
  en_route_icing_intensity: [number, number];
  en_route_turbulence_intensity: [number, number];
  en_route_convective_potential: [number, number];
  ceiling_at_destination: [number, number];
  surface_visibility_at_destination: [number, number];
  crosswinds_at_destination_airport: [number, number];
}
