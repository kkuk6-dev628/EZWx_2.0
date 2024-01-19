import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReceiveNewsFieldIntoUserTable1705506995195 implements MigrationInterface {
  name = 'AddReceiveNewsFieldIntoUserTable1705506995195';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "receive_news" boolean NOT NULL DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "receive_news"`);
  }
}
