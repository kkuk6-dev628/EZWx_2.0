import { MigrationInterface, QueryRunner } from "typeorm";

export class changeDecimalFiledsSettings1679623990848 implements MigrationInterface {
    name = 'changeDecimalFiledsSettings1679623990848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_at_departure_min"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_at_departure_min" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_at_departure_max"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_at_departure_max" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_along_route_min"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_along_route_min" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_along_route_max"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_along_route_max" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_at_departure_min"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_at_departure_min" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_at_departure_max"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_at_departure_max" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_along_route_min"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_along_route_min" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_along_route_max"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_along_route_max" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_at_departure_min"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_at_departure_min" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_at_departure_max"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_at_departure_max" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_along_route_min"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_along_route_min" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_along_route_max"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_along_route_max" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_at_departure_min"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_at_departure_min" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_at_departure_max"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_at_departure_max" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_along_route_min"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_along_route_min" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_along_route_max"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_along_route_max" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_along_route_max"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_along_route_max" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_along_route_min"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_along_route_min" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_at_departure_max"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_at_departure_max" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_at_departure_min"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_at_departure_min" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_along_route_max"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_along_route_max" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_along_route_min"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_along_route_min" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_at_departure_max"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_at_departure_max" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_at_departure_min"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_at_departure_min" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_along_route_max"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_along_route_max" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_along_route_min"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_along_route_min" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_at_departure_max"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_at_departure_max" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "surface_visibility_at_departure_min"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "surface_visibility_at_departure_min" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_along_route_max"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_along_route_max" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_along_route_min"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_along_route_min" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_at_departure_max"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_at_departure_max" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "default_setting" DROP COLUMN "surface_visibility_at_departure_min"`);
        await queryRunner.query(`ALTER TABLE "default_setting" ADD "surface_visibility_at_departure_min" integer NOT NULL`);
    }

}
