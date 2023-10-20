import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecentAirportTable1697814036585 implements MigrationInterface {
  name = 'CreateRecentAirportTable1697814036585';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "recent_airport" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "airportId" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_cd8c840dc26a839aa017a2d6cb3" UNIQUE ("userId"), CONSTRAINT "PK_7fd06f54636d556110863658307" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_cd8c840dc26a839aa017a2d6cb" ON "recent_airport" ("userId") `);
    await queryRunner.query(`ALTER TABLE "imagery" ADD "selectedImageryId" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "imagery" DROP COLUMN "selectedImageryId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cd8c840dc26a839aa017a2d6cb"`);
    await queryRunner.query(`DROP TABLE "recent_airport"`);
  }
}
