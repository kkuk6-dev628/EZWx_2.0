import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarColumnIntoUserTable1705416338752 implements MigrationInterface {
  name = 'AddAvatarColumnIntoUserTable1705416338752';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "avatar" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "country" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
  }
}
