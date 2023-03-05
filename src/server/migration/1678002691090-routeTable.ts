import { MigrationInterface, QueryRunner } from 'typeorm';

export class routeTable1678002691090 implements MigrationInterface {
  name = 'routeTable1678002691090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "route_points" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "type" character varying NOT NULL, "order" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "routeId" integer, CONSTRAINT "PK_9684d129d71ff38906e7cb08c68" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "route" ("id" SERIAL NOT NULL, "departure" character varying NOT NULL, "destination" character varying NOT NULL, "altitude" integer NOT NULL, "useForecastWinds" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_08affcd076e46415e5821acf52d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "route" ADD "userId" integer`);
    await queryRunner.query(
      `ALTER TABLE "route_points" ADD CONSTRAINT "FK_a2eab28234f80f4a7962495d5b6" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route" ADD CONSTRAINT "FK_5f1f8af943496a71fa29f6a44f9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_5f1f8af943496a71fa29f6a44f9"`);
    await queryRunner.query(`ALTER TABLE "route_points" DROP CONSTRAINT "FK_a2eab28234f80f4a7962495d5b6"`);
    await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "route" ADD "userId" integer`);
    await queryRunner.query(`DROP TABLE "route"`);
    await queryRunner.query(`DROP TABLE "route_points"`);
  }
}
