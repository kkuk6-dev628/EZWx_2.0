import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUserIdUniqueConstrainOfRecentAirportsTable1698635890450 implements MigrationInterface {
  name = 'RemoveUserIdUniqueConstrainOfRecentAirportsTable1698635890450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recent_airport" DROP CONSTRAINT "UQ_cd8c840dc26a839aa017a2d6cb3"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recent_airport" ADD CONSTRAINT "UQ_cd8c840dc26a839aa017a2d6cb3" UNIQUE ("userId")`,
    );
  }
}
