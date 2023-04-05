import { MigrationInterface, QueryRunner } from 'typeorm';

export class setUniqueFieldsForUserSettings1680707593189 implements MigrationInterface {
  name = 'setUniqueFieldsForUserSettings1680707593189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_at_departure_min"`);
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_at_departure_min" numeric NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_at_departure_max"`);
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_at_departure_max" numeric NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_along_route_min"`);
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_along_route_min" numeric NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_along_route_max"`);
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_along_route_max" numeric NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "UQ_4ed056b9344e6f7d8d46ec4b302" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "layer_control" ADD CONSTRAINT "UQ_d82382bc370f3fa46688424c23a" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "base_layer_control" ADD CONSTRAINT "UQ_a7d6cc1fbc3cc5b5e40265cf310" UNIQUE ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "base_layer_control" DROP CONSTRAINT "UQ_a7d6cc1fbc3cc5b5e40265cf310"`);
    await queryRunner.query(`ALTER TABLE "layer_control" DROP CONSTRAINT "UQ_d82382bc370f3fa46688424c23a"`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "UQ_4ed056b9344e6f7d8d46ec4b302"`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_along_route_max"`);
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_along_route_max" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_along_route_min"`);
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_along_route_min" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_at_departure_max"`);
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_at_departure_max" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_at_departure_min"`);
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_at_departure_min" integer NOT NULL`);
  }
}
