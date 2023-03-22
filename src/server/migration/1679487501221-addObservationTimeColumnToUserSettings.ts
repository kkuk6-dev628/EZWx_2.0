import { MigrationInterface, QueryRunner } from 'typeorm';

export class addObservationTimeColumnToUserSettings1679487501221 implements MigrationInterface {
  name = 'addObservationTimeColumnToUserSettings1679487501221';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "observation_time" bigint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "observation_interval" integer NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "observation_interval"`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "observation_time"`);
  }
}
