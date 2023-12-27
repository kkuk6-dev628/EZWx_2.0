import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLandingpageFieldToSettingsTable1703518291245 implements MigrationInterface {
    name = 'AddLandingpageFieldToSettingsTable1703518291245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_settings" ADD "landing_page" character varying NOT NULL DEFAULT 'dashboard'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "landing_page"`);
    }

}
