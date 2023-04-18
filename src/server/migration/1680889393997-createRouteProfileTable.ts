import { MigrationInterface, QueryRunner } from 'typeorm';

export class createRouteProfileTable1680889393997 implements MigrationInterface {
  name = 'createRouteProfileTable1680889393997';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "route_profile" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "chartType" character varying NOT NULL, "windLayer" character varying NOT NULL, "icingLayers" character varying NOT NULL, "turbLayers" character varying NOT NULL, "maxAltitude" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_63987f8e01d19568f266a13de8d" UNIQUE ("userId"), CONSTRAINT "PK_c91235ff694f9294599abf2271f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_63987f8e01d19568f266a13de8" ON "route_profile" ("userId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_63987f8e01d19568f266a13de8"`);
    await queryRunner.query(`DROP TABLE "route_profile"`);
  }
}
