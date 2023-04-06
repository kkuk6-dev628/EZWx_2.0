import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSeveralTables1680715857542 implements MigrationInterface {
  name = 'addSeveralTables1680715857542';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "route_points" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "position" character varying NOT NULL, CONSTRAINT "PK_9684d129d71ff38906e7cb08c68" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_89993f71977c1490be6a660ee9" ON "route_points" ("key", "type") `);
    await queryRunner.query(
      `CREATE TABLE "route_of_flight" ("id" SERIAL NOT NULL, "routeId" integer NOT NULL, "routePointId" integer NOT NULL, "order" integer NOT NULL, CONSTRAINT "PK_91957deb7a6292d7043a075beb4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_efe1f5ac6e8f1bbf64de48751e" ON "route_of_flight" ("routeId") `);
    await queryRunner.query(`CREATE INDEX "IDX_82dd2b519bec418064a6442c58" ON "route_of_flight" ("routePointId") `);
    await queryRunner.query(
      `CREATE TABLE "route" ("id" SERIAL NOT NULL, "altitude" integer NOT NULL, "useForecastWinds" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "destinationId" integer, "departureId" integer, "userId" integer, CONSTRAINT "PK_08affcd076e46415e5821acf52d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_5f1f8af943496a71fa29f6a44f" ON "route" ("userId") `);
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("id" SERIAL NOT NULL, "observation_time" bigint NOT NULL, "observation_interval" integer NOT NULL, "default_home_airport" character varying NOT NULL, "default_temperature_unit" boolean NOT NULL, "default_time_display_unit" boolean NOT NULL, "default_wind_speed_unit" boolean NOT NULL, "default_distance_unit" boolean NOT NULL, "default_visibility_unit" boolean NOT NULL, "max_takeoff_weight_category" character varying NOT NULL, "true_airspeed" integer NOT NULL, "ceiling_at_departure_min" integer NOT NULL, "ceiling_at_departure_max" integer NOT NULL, "surface_visibility_at_departure_min" numeric NOT NULL, "surface_visibility_at_departure_max" numeric NOT NULL, "crosswinds_at_departure_airport_min" integer NOT NULL, "crosswinds_at_departure_airport_max" integer NOT NULL, "ceiling_along_route_min" integer NOT NULL, "ceiling_along_route_max" integer NOT NULL, "surface_visibility_along_route_min" numeric NOT NULL, "surface_visibility_along_route_max" numeric NOT NULL, "en_route_icing_probability_min" integer NOT NULL, "en_route_icing_probability_max" integer NOT NULL, "en_route_icing_intensity_min" integer NOT NULL, "en_route_icing_intensity_max" integer NOT NULL, "en_route_turbulence_intensity_min" integer NOT NULL, "en_route_turbulence_intensity_max" integer NOT NULL, "en_route_convective_potential_min" integer NOT NULL, "en_route_convective_potential_max" integer NOT NULL, "ceiling_at_destination_min" integer NOT NULL, "ceiling_at_destination_max" integer NOT NULL, "surface_visibility_at_destination_min" numeric NOT NULL, "surface_visibility_at_destination_max" numeric NOT NULL, "crosswinds_at_destination_airport_min" integer NOT NULL, "crosswinds_at_destination_airport_max" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_4ed056b9344e6f7d8d46ec4b302" UNIQUE ("user_id"), CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "base_layer_control" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "show" boolean NOT NULL, "bounds" character varying NOT NULL, "usProvincesState" character varying NOT NULL, "canadianProvincesState" character varying NOT NULL, "countryWarningAreaState" character varying NOT NULL, "streetState" character varying NOT NULL, "topoState" character varying NOT NULL, "terrainState" character varying NOT NULL, "darkState" character varying NOT NULL, "satelliteState" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_a7d6cc1fbc3cc5b5e40265cf310" UNIQUE ("userId"), CONSTRAINT "PK_ea8ea4f4a7bcde459ccb207c634" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_a7d6cc1fbc3cc5b5e40265cf31" ON "base_layer_control" ("userId") `);
    await queryRunner.query(
      `CREATE TABLE "layer_control" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "show" boolean NOT NULL, "stationMarkersState" character varying NOT NULL, "radarState" character varying NOT NULL, "sigmetState" character varying NOT NULL, "gairmetState" character varying NOT NULL, "pirepState" character varying NOT NULL, "cwaState" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_d82382bc370f3fa46688424c23a" UNIQUE ("userId"), CONSTRAINT "PK_1bc891fe35d9355cd79d3ce70ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_d82382bc370f3fa46688424c23" ON "layer_control" ("userId") `);
    await queryRunner.query(`ALTER TABLE "user" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "route_of_flight" ADD CONSTRAINT "FK_efe1f5ac6e8f1bbf64de48751ee" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_of_flight" ADD CONSTRAINT "FK_82dd2b519bec418064a6442c582" FOREIGN KEY ("routePointId") REFERENCES "route_points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_c6a2943027f1890c9cbabe3120e" FOREIGN KEY ("destinationId") REFERENCES "route_points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_c08895d1f6205d71a234a0a65a4" FOREIGN KEY ("departureId") REFERENCES "route_points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_5f1f8af943496a71fa29f6a44f9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_5f1f8af943496a71fa29f6a44f9"`);
    await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_c08895d1f6205d71a234a0a65a4"`);
    await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_c6a2943027f1890c9cbabe3120e"`);
    await queryRunner.query(`ALTER TABLE "route_of_flight" DROP CONSTRAINT "FK_82dd2b519bec418064a6442c582"`);
    await queryRunner.query(`ALTER TABLE "route_of_flight" DROP CONSTRAINT "FK_efe1f5ac6e8f1bbf64de48751ee"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d82382bc370f3fa46688424c23"`);
    await queryRunner.query(`DROP TABLE "layer_control"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a7d6cc1fbc3cc5b5e40265cf31"`);
    await queryRunner.query(`DROP TABLE "base_layer_control"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5f1f8af943496a71fa29f6a44f"`);
    await queryRunner.query(`DROP TABLE "route"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_82dd2b519bec418064a6442c58"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_efe1f5ac6e8f1bbf64de48751e"`);
    await queryRunner.query(`DROP TABLE "route_of_flight"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_89993f71977c1490be6a660ee9"`);
    await queryRunner.query(`DROP TABLE "route_points"`);
  }
}
