import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserCertification1672171337646 implements MigrationInterface {
  name = 'UserCertification1672171337646';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstname" character varying NOT NULL, "lastname" character varying NOT NULL, "email" character varying NOT NULL, "hash" character varying NOT NULL, "hearAbout" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "certification" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_a7364bd3e4a407f67d8165b820c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "certification" ADD CONSTRAINT "FK_5c8aa0b948082342bc49d1bcfd9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "certification" DROP CONSTRAINT "FK_5c8aa0b948082342bc49d1bcfd9"`,
    );
    await queryRunner.query(`DROP TABLE "certification"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
