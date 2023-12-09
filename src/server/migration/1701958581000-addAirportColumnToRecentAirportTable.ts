import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAirportColumnToRecentAirportTable1701958581000 implements MigrationInterface {
  name = 'AddAirportColumnToRecentAirportTable1701958581000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recent_airport" ADD "airport" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recent_airport" DROP COLUMN "airport"`);
  }
}
