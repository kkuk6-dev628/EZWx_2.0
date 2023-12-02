import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFavoritesTables1701444919037 implements MigrationInterface {
  name = 'CreateFavoritesTables1701444919037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "favorites_items" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "text" character varying NOT NULL, "selected" boolean NOT NULL, "droppable" boolean NOT NULL, "data" character varying, "parent" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_f6db8b4201eb7ec11713d227417" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_925ff671d920065d3176b48fc9" ON "favorites_items" ("userId") `);
    await queryRunner.query(
      `CREATE TABLE "favorites_orders" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "order" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_a83c3047958567e9195c2e1666d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_22f33562e9be05d8a5d3cf7157" ON "favorites_orders" ("userId") `);
    await queryRunner.query(
      `INSERT INTO favorites_items ("id", "userId", "text", "selected", "droppable", "data", "parent") VALUES(1, 0, 'EZWxBrief', false, true, 'root', 0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_22f33562e9be05d8a5d3cf7157"`);
    await queryRunner.query(`DROP TABLE "favorites_orders"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_925ff671d920065d3176b48fc9"`);
    await queryRunner.query(`DROP TABLE "favorites_items"`);
  }
}
