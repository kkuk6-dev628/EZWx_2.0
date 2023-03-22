import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertDefaultSettings1677594997007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO default_setting (
        default_home_airport,
        default_temperature_unit,
        default_time_display_unit,
        default_wind_speed_unit,
        default_distance_unit,
        default_visibility_unit,
        max_takeoff_weight_category,
        true_airspeed,
        ceiling_at_departure_min,
        ceiling_at_departure_max,
        surface_visibility_at_departure_min,
        surface_visibility_at_departure_max,
        crosswinds_at_departure_airport_min,
        crosswinds_at_departure_airport_max,
        ceiling_along_route_min,
        ceiling_along_route_max,
        surface_visibility_along_route_min,
        surface_visibility_along_route_max,
        en_route_icing_probability_min,
        en_route_icing_probability_max,
        en_route_icing_intensity_min,
        en_route_icing_intensity_max,
        en_route_turbulence_intensity_min,
        en_route_turbulence_intensity_max,
        en_route_convective_potential_min,
        en_route_convective_potential_max,
        ceiling_at_destination_min,
        ceiling_at_destination_max,
        surface_visibility_at_destination_min,
        surface_visibility_at_destination_max,
        crosswinds_at_destination_airport_min,
        crosswinds_at_destination_airport_max
      ) VALUES ('home', ${false}, ${false}, ${false}, ${false}, ${false}, 'light',${50}, ${1000}, ${3000}, ${3}, ${7}, ${10}, ${15}, ${1000}, ${3000}, ${3}, ${7}, ${10}, ${20}, ${5}, ${100}, ${16}, ${36}, ${2}, ${10}, ${1000}, ${3000}, ${3}, ${7}, ${10}, ${15})`,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
