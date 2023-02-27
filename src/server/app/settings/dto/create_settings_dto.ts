export class CreateUserSettingsDto {
  default_home_airport: string;
  default_temperature_unit: string;
  default_time_display_unit: string;
  default_wind_speed_unit: string;
  default_distance_unit: string;
  default_visibility_unit: string;

  //AirCraft Setting Fields
  max_takeoff_weight_category: string;
  true_airspeed: number;

  //Personal Minimums Fields

  ceiling_at_departure: number[];

  surface_visibility_at_departure: number[];

  crosswinds_at_departure_airport: number[];

  ceiling_along_route: number[];

  surface_visibility_along_route: number[];

  en_route_icing_probability: string[];


  en_route_turbulence_intensity: number[];

  en_route_convective_potential: number[];

  ceiling_at_destination: number[];

  surface_visibility_at_destination: number[];

  crosswinds_at_destination_airport: number[];
  user_id: number;
}

export class UpdateUserSettingsDto {
  id: number;
  default_home_airport: string;
  default_temperature_unit: string;
  default_time_display_unit: string;
  default_wind_speed_unit: string;
  default_distance_unit: string;
  default_visibility_unit: string;

  //AirCraft Setting Fields
  max_takeoff_weight_category: string;
  true_airspeed: number;

  //Personal Minimums Fields

  ceiling_at_departure: number[];

  surface_visibility_at_departure: number[];

  crosswinds_at_departure_airport: number[];

  ceiling_along_route: number[];

  surface_visibility_along_route: number[];

  en_route_icing_probability: string[];
  en_route_icing_intensity:number[]

  en_route_turbulence_intensity: number[];

  en_route_convective_potential: number[];

  ceiling_at_destination: number[];

  surface_visibility_at_destination: number[];

  crosswinds_at_destination_airport: number[];
  user_id: number;
}
