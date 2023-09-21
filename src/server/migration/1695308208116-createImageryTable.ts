import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateImageryTable1695308208116 implements MigrationInterface {
  name = 'CreateImageryTable1695308208116';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "FK_28b4621dbd65022543a6441f55c"`);
    await queryRunner.query(
      `CREATE TABLE "imagery" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "selectedLvl1" integer NOT NULL, "selectedLvl2" integer, "selectedLvl3" integer, "selectedLvl4" integer, "selectedImageryName" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_72cbe235695aa071fb05d19cd11" UNIQUE ("userId"), CONSTRAINT "PK_237d45742d287e8435134077651" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_72cbe235695aa071fb05d19cd1" ON "imagery" ("userId") `);
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_28b4621dbd65022543a6441f55c" FOREIGN KEY ("activeRouteId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "FK_28b4621dbd65022543a6441f55c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_72cbe235695aa071fb05d19cd1"`);
    await queryRunner.query(`DROP TABLE "imagery"`);
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_28b4621dbd65022543a6441f55c" FOREIGN KEY ("activeRouteId") REFERENCES "route_points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
