import { MigrationInterface, QueryRunner } from "typeorm";

export class routeTables1678160255151 implements MigrationInterface {
    name = 'routeTables1678160255151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "route" ("id" SERIAL NOT NULL, "altitude" integer NOT NULL, "useForecastWinds" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "destinationId" integer, "departureId" integer, "userId" integer, CONSTRAINT "PK_08affcd076e46415e5821acf52d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "route_points" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "position" character varying NOT NULL, CONSTRAINT "PK_9684d129d71ff38906e7cb08c68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "route_of_flight" ("id" SERIAL NOT NULL, "routeId" integer NOT NULL, "routePointId" integer NOT NULL, "order" integer NOT NULL, CONSTRAINT "PK_91957deb7a6292d7043a075beb4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "route" ADD CONSTRAINT "FK_c6a2943027f1890c9cbabe3120e" FOREIGN KEY ("destinationId") REFERENCES "route_points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "route" ADD CONSTRAINT "FK_c08895d1f6205d71a234a0a65a4" FOREIGN KEY ("departureId") REFERENCES "route_points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "route" ADD CONSTRAINT "FK_5f1f8af943496a71fa29f6a44f9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "route_of_flight" ADD CONSTRAINT "FK_efe1f5ac6e8f1bbf64de48751ee" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "route_of_flight" ADD CONSTRAINT "FK_82dd2b519bec418064a6442c582" FOREIGN KEY ("routePointId") REFERENCES "route_points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "route_of_flight" DROP CONSTRAINT "FK_82dd2b519bec418064a6442c582"`);
        await queryRunner.query(`ALTER TABLE "route_of_flight" DROP CONSTRAINT "FK_efe1f5ac6e8f1bbf64de48751ee"`);
        await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_5f1f8af943496a71fa29f6a44f9"`);
        await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_c08895d1f6205d71a234a0a65a4"`);
        await queryRunner.query(`ALTER TABLE "route" DROP CONSTRAINT "FK_c6a2943027f1890c9cbabe3120e"`);
        await queryRunner.query(`DROP TABLE "route_of_flight"`);
        await queryRunner.query(`DROP TABLE "route_points"`);
        await queryRunner.query(`DROP TABLE "route"`);
    }

}
