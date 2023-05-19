import { MigrationInterface, QueryRunner } from 'typeorm';

export class addShowTemperatureIntoRouteProfile1684462346135 implements MigrationInterface {
  name = 'addShowTemperatureIntoRouteProfile1684462346135';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "route_profile" ADD "showTemperature" boolean`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "route_profile" DROP COLUMN "showTemperature"`);
  }
}
