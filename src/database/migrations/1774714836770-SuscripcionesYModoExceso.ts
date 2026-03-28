import { MigrationInterface, QueryRunner } from "typeorm";

export class SuscripcionesYModoExceso1774714836770 implements MigrationInterface {
    name = 'SuscripcionesYModoExceso1774714836770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clientes" RENAME COLUMN "suscripcion" TO "modo_exceso"`);
        await queryRunner.query(`CREATE TYPE "public"."cliente_suscripciones_tipo_enum" AS ENUM('PROFESSIONAL', 'BUSINESS', 'ENTERPRISE')`);
        await queryRunner.query(`CREATE TABLE "cliente_suscripciones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tipo" "public"."cliente_suscripciones_tipo_enum" NOT NULL, "start_timestamp" TIMESTAMP NOT NULL, "end_timestamp" TIMESTAMP, "cliente_id" uuid NOT NULL, CONSTRAINT "PK_c971e4211fd90b0e10910ca5b3e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "registros_uso" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fecha" date NOT NULL, "consultas_recomendaciones" integer NOT NULL DEFAULT '0', "cliente_id" uuid NOT NULL, CONSTRAINT "UQ_a9f7e530a52fed9a5f524fc8612" UNIQUE ("cliente_id", "fecha"), CONSTRAINT "PK_5195df61de2088d387e367c10f6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "clientes" DROP COLUMN "modo_exceso"`);
        await queryRunner.query(`CREATE TYPE "public"."clientes_modo_exceso_enum" AS ENUM('RECHAZAR', 'COBRAR')`);
        await queryRunner.query(`ALTER TABLE "clientes" ADD "modo_exceso" "public"."clientes_modo_exceso_enum" NOT NULL DEFAULT 'RECHAZAR'`);
        await queryRunner.query(`ALTER TABLE "cliente_suscripciones" ADD CONSTRAINT "FK_b45f6bdc99272cc72bcec57e6b3" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "registros_uso" ADD CONSTRAINT "FK_574b6239cb2ae5323899c81deb0" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "registros_uso" DROP CONSTRAINT "FK_574b6239cb2ae5323899c81deb0"`);
        await queryRunner.query(`ALTER TABLE "cliente_suscripciones" DROP CONSTRAINT "FK_b45f6bdc99272cc72bcec57e6b3"`);
        await queryRunner.query(`ALTER TABLE "clientes" DROP COLUMN "modo_exceso"`);
        await queryRunner.query(`DROP TYPE "public"."clientes_modo_exceso_enum"`);
        await queryRunner.query(`ALTER TABLE "clientes" ADD "modo_exceso" character varying`);
        await queryRunner.query(`DROP TABLE "registros_uso"`);
        await queryRunner.query(`DROP TABLE "cliente_suscripciones"`);
        await queryRunner.query(`DROP TYPE "public"."cliente_suscripciones_tipo_enum"`);
        await queryRunner.query(`ALTER TABLE "clientes" RENAME COLUMN "modo_exceso" TO "suscripcion"`);
    }

}
