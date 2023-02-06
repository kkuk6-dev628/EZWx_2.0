import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1674870647142 implements MigrationInterface {
  name = 'InitialMigration1674870647142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "certification" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_a7364bd3e4a407f67d8165b820c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstname" character varying NOT NULL, "lastname" character varying NOT NULL, "email" character varying NOT NULL, "hash" character varying NOT NULL, "hearAbout" character varying NOT NULL, "displayName" character varying NOT NULL, "alternateEmail" character varying, "address1" character varying, "address2" character varying, "city" character varying, "stateProvince" character varying, "zip" character varying, "phoneType" character varying, "phone" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_certification" ("userId" integer NOT NULL, "certificationId" integer NOT NULL, CONSTRAINT "PK_8dae0a94680202a877753c30e67" PRIMARY KEY ("userId", "certificationId"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_4e90ed5064cf1d34505e47ddd8" ON "user_certification" ("userId") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_31eee85b3a0aa36c91e92ec71d" ON "user_certification" ("certificationId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_certification" ADD CONSTRAINT "FK_4e90ed5064cf1d34505e47ddd8d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_certification" ADD CONSTRAINT "FK_31eee85b3a0aa36c91e92ec71df" FOREIGN KEY ("certificationId") REFERENCES "certification"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_certification" DROP CONSTRAINT "FK_31eee85b3a0aa36c91e92ec71df"`);
    await queryRunner.query(`ALTER TABLE "user_certification" DROP CONSTRAINT "FK_4e90ed5064cf1d34505e47ddd8d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_31eee85b3a0aa36c91e92ec71d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4e90ed5064cf1d34505e47ddd8"`);
    await queryRunner.query(`DROP TABLE "user_certification"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "certification"`);
  }
}
