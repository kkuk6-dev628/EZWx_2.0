import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSavedTables1701656460129 implements MigrationInterface {
  name = 'CreateSavedTables1701656460129';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "saved_items" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "text" character varying NOT NULL, "selected" boolean NOT NULL, "droppable" boolean NOT NULL, "data" character varying, "parent" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_178c333cea0ad47a6c7a3321349" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_373694bbf76eed2f7fbed1eb25" ON "saved_items" ("userId") `);
    await queryRunner.query(
      `CREATE TABLE "saved_order" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "order" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_89655d6475d6689d7628d827353" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_66f4efcce469ee4ac99d3ef647" ON "saved_order" ("userId") `);
    await queryRunner.query(
      `INSERT INTO saved_items ("id", "userId", "text", "selected", "droppable", "data", "parent") VALUES(1, 0, 'EZWxBrief', false, true, 'root', 0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_66f4efcce469ee4ac99d3ef647"`);
    await queryRunner.query(`DROP TABLE "saved_order"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_373694bbf76eed2f7fbed1eb25"`);
    await queryRunner.query(`DROP TABLE "saved_items"`);
  }
}
