import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUniqueUserIdFromImageryTable1702644086890 implements MigrationInterface {
  name = 'RemoveUniqueUserIdFromImageryTable1702644086890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "imagery" DROP CONSTRAINT "UQ_72cbe235695aa071fb05d19cd11"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "imagery" ADD CONSTRAINT "UQ_72cbe235695aa071fb05d19cd11" UNIQUE ("userId")`);
  }
}
