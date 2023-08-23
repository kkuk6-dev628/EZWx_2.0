import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveRouteColumn1692724617820 implements MigrationInterface {
  name = 'AddActiveRouteColumn1692724617820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "activeRouteId" integer`);
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "UQ_28b4621dbd65022543a6441f55c" UNIQUE ("activeRouteId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_28b4621dbd65022543a6441f55c" FOREIGN KEY ("activeRouteId") REFERENCES "route_points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "FK_28b4621dbd65022543a6441f55c"`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "UQ_28b4621dbd65022543a6441f55c"`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "activeRouteId"`);
  }
}
