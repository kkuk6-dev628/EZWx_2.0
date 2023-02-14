import { MigrationInterface, QueryRunner } from "typeorm";

export class settings1676395041223 implements MigrationInterface {
    name = 'settings1676395041223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "settings" ("id" SERIAL NOT NULL, "default_home_airport" character varying NOT NULL, "default_temperature_unit" character varying NOT NULL, "default_time_display_unit" character varying NOT NULL, "default_wind_speed_unit" character varying NOT NULL, "default_distance_unit" character varying NOT NULL, "default_visibility_unit" character varying NOT NULL, "max_takeoff_weight_category" character varying NOT NULL, "true_airspeed" integer NOT NULL, "ceiling_at_departure" integer NOT NULL, "surface_visibility_at_departure" integer NOT NULL, "crosswinds_at_departure_airport" integer NOT NULL, "ceiling_along_route" integer NOT NULL, "surface_visibility_along_route" integer NOT NULL, "en_route_icing_probability" integer NOT NULL, "en_route_turbulence_intensity" integer NOT NULL, "en_route_convective_potential" integer NOT NULL, "ceiling_at_destination" integer NOT NULL, "surface_visibility_at_destination" integer NOT NULL, "crosswinds_at_destination_airport" integer NOT NULL, CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "settings"`);
    }

}
