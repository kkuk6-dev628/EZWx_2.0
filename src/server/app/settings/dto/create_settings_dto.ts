export class CreateUserSettingsDto {
  observation_time: string;
  observation_interval: number;
  default_home_airport: string;
  default_temperature_unit: boolean;
  default_time_display_unit: boolean;
  default_wind_speed_unit: boolean;
  default_distance_unit: boolean;
  default_visibility_unit: boolean;

  //AirCraft Setting Fields
  max_takeoff_weight_category: string;
  true_airspeed: number;

  //Personal Minimums Fields

  ceiling_at_departure_min: number;
  ceiling_at_departure_max: number;

  surface_visibility_at_departure_min: number;
  surface_visibility_at_departure_max: number;

  crosswinds_at_departure_airport_min: number;
  crosswinds_at_departure_airport_max: number;

  ceiling_along_route_min: number;
  ceiling_along_route_max: number;

  surface_visibility_along_route_min: number;
  surface_visibility_along_route_max: number;

  en_route_icing_probability_min: number;
  en_route_icing_probability_max: number;

  en_route_icing_intensity_min: number;
  en_route_icing_intensity_max: number;

  en_route_turbulence_intensity_min: number;

  en_route_turbulence_intensity_max: number;

  en_route_convective_potential_min: number;
  en_route_convective_potential_max: number;

  ceiling_at_destination_min: number;
  ceiling_at_destination_max: number;

  surface_visibility_at_destination_min: number;
  surface_visibility_at_destination_max: number;

  crosswinds_at_destination_airport_min: number;
  crosswinds_at_destination_airport_max: number;
  user_id: number;
}

export class UpdateUserSettingsDto {
  id: number;
  observation_time: string;
  observation_interval: number;
  default_home_airport: string;
  default_temperature_unit: boolean;
  default_time_display_unit: boolean;
  default_wind_speed_unit: boolean;
  default_distance_unit: boolean;
  default_visibility_unit: boolean;

  //AirCraft Setting Fields
  max_takeoff_weight_category: string;
  true_airspeed: number;

  //Personal Minimums Fields

  ceiling_at_departure: number[];

  surface_visibility_at_departure: number[];

  crosswinds_at_departure_airport: number[];

  ceiling_along_route: number[];

  surface_visibility_along_route: number[];

  en_route_icing_probability: number[];
  en_route_icing_intensity: number[];

  en_route_turbulence_intensity: number[];

  en_route_convective_potential: number[];

  ceiling_at_destination: number[];

  surface_visibility_at_destination: number[];

  crosswinds_at_destination_airport: number[];
  user_id: number;
}
