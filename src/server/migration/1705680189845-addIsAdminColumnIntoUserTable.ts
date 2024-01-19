import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsAdminColumnIntoUserTable1705680189845 implements MigrationInterface {
  name = 'AddIsAdminColumnIntoUserTable1705680189845';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "is_admin" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_admin"`);
  }
}
