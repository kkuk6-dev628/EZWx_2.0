import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBoundsColumnToBaseLayerControl1679422957143 implements MigrationInterface {
  name = 'addBoundsColumnToBaseLayerControl1679422957143';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "base_layer_control" ADD "bounds" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "base_layer_control" DROP COLUMN "bounds"`);
  }
}
