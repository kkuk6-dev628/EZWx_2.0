import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDefaultSettingsHomeAirport1678160255152 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE default_setting SET default_home_airport='KCLT'`);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
