import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAirportwxStateTable1698117269145 implements MigrationInterface {
  name = 'CreateAirportwxStateTable1698117269145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "airportwx_state" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "airport" character varying NOT NULL, "viewType" character varying NOT NULL, "chartType" character varying NOT NULL, "windLayer" character varying NOT NULL, "icingLayers" character varying NOT NULL, "turbLayers" character varying NOT NULL, "maxAltitude" integer NOT NULL, "showTemperature" boolean, "chartDays" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_1304ac4f0c304485d2da5c338c3" UNIQUE ("userId"), CONSTRAINT "PK_3644be72a3ba276887585640e40" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_1304ac4f0c304485d2da5c338c" ON "airportwx_state" ("userId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_1304ac4f0c304485d2da5c338c"`);
    await queryRunner.query(`DROP TABLE "airportwx_state"`);
  }
}
