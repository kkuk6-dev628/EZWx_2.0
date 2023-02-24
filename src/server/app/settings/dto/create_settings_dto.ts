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

  en_route_icing_probability_min: string;
  en_route_icing_probability_max: string;

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

  en_route_icing_probability_min: string;
  en_route_icing_probability_max: string;

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
