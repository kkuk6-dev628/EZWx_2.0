import { MigrationInterface, QueryRunner } from 'typeorm';

export class layerControlTable1679331516134 implements MigrationInterface {
  name = 'layerControlTable1679331516134';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "base_layer_control" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "show" boolean NOT NULL, "usProvincesState" character varying NOT NULL, "canadianProvincesState" character varying NOT NULL, "countryWarningAreaState" character varying NOT NULL, "streetState" character varying NOT NULL, "topoState" character varying NOT NULL, "terrainState" character varying NOT NULL, "darkState" character varying NOT NULL, "satelliteState" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_ea8ea4f4a7bcde459ccb207c634" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_a7d6cc1fbc3cc5b5e40265cf31" ON "base_layer_control" ("userId") `);
    await queryRunner.query(
      `CREATE TABLE "layer_control" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "show" boolean NOT NULL, "stationMarkersState" character varying NOT NULL, "radarState" character varying NOT NULL, "sigmetState" character varying NOT NULL, "gairmetState" character varying NOT NULL, "pirepState" character varying NOT NULL, "cwaState" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_1bc891fe35d9355cd79d3ce70ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_d82382bc370f3fa46688424c23" ON "layer_control" ("userId") `);
    await queryRunner.query(`ALTER TABLE "user" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(`CREATE INDEX "IDX_89993f71977c1490be6a660ee9" ON "route_points" ("key", "type") `);
    await queryRunner.query(`CREATE INDEX "IDX_efe1f5ac6e8f1bbf64de48751e" ON "route_of_flight" ("routeId") `);
    await queryRunner.query(`CREATE INDEX "IDX_82dd2b519bec418064a6442c58" ON "route_of_flight" ("routePointId") `);
    await queryRunner.query(`CREATE INDEX "IDX_5f1f8af943496a71fa29f6a44f" ON "route" ("userId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_5f1f8af943496a71fa29f6a44f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_82dd2b519bec418064a6442c58"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_efe1f5ac6e8f1bbf64de48751e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_89993f71977c1490be6a660ee9"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d82382bc370f3fa46688424c23"`);
    await queryRunner.query(`DROP TABLE "layer_control"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a7d6cc1fbc3cc5b5e40265cf31"`);
    await queryRunner.query(`DROP TABLE "base_layer_control"`);
  }
}
