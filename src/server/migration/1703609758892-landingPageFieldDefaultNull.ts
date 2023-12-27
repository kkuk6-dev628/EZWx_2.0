import { MigrationInterface, QueryRunner } from "typeorm";

export class LandingPageFieldDefaultNull1703609758892 implements MigrationInterface {
    name = 'LandingPageFieldDefaultNull1703609758892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "landing_page" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "landing_page" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "landing_page" SET DEFAULT 'dashboard'`);
        await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "landing_page" SET NOT NULL`);
    }

}
