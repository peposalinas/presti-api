import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1774681854290 implements MigrationInterface {
    name = 'InitialSchema1774681854290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clientes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "suscripcion" character varying, CONSTRAINT "PK_d76bf3571d906e4e86470482c08" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("cuil" character varying(11) NOT NULL, "nombre" character varying(100) NOT NULL, "fechaNacimiento" date NOT NULL, "cliente_id" uuid NOT NULL, CONSTRAINT "PK_fcfefd42e72560db18c39409970" PRIMARY KEY ("cuil"))`);
        await queryRunner.query(`CREATE TABLE "tipos_producto" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "cliente_id" uuid NOT NULL, CONSTRAINT "PK_58618d40dce38bc9c6a610386fa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "productos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "activo" boolean NOT NULL, "tipo_producto_id" uuid NOT NULL, "cliente_id" uuid NOT NULL, CONSTRAINT "PK_04f604609a0949a7f3b43400766" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reglas_parametro_enum" AS ENUM('SCORE_CREDITICIO', 'SITUACION_BCRA', 'MONTO_SOLICITADO', 'PLAZO_SOLICITADO', 'EDAD', 'INGRESOS')`);
        await queryRunner.query(`CREATE TYPE "public"."reglas_operador_enum" AS ENUM('IGUAL', 'DISTINTO', 'MAYOR_QUE', 'MENOR_QUE', 'MAYOR_O_IGUAL', 'MENOR_O_IGUAL')`);
        await queryRunner.query(`CREATE TYPE "public"."reglas_tipo_valor_enum" AS ENUM('NUMERO', 'TEXTO', 'BOOLEANO', 'FECHA')`);
        await queryRunner.query(`CREATE TABLE "reglas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "parametro" "public"."reglas_parametro_enum" NOT NULL, "operador" "public"."reglas_operador_enum" NOT NULL, "valor" text NOT NULL, "tipo_valor" "public"."reglas_tipo_valor_enum" NOT NULL, "prioridad" integer NOT NULL, "producto_id" uuid NOT NULL, "cliente_id" uuid NOT NULL, CONSTRAINT "PK_99ff52ebe88e119445c72870bb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recomendaciones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "timestamp" TIMESTAMP NOT NULL, "exito" boolean NOT NULL, "cliente_id" uuid NOT NULL, CONSTRAINT "PK_8641e57715057b969f02d7d2042" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_5f4dc9b4cf1f7993658c5c22927" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tipos_producto" ADD CONSTRAINT "FK_4d5b32ec25387175664fa3fa286" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_f66e547b5ff945b8eb4512aa58c" FOREIGN KEY ("tipo_producto_id") REFERENCES "tipos_producto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_4dbb6c18b54a48fb3d7072cad5e" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reglas" ADD CONSTRAINT "FK_bf9c08aa8980dccb564895721d5" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reglas" ADD CONSTRAINT "FK_412ebf60794edb34945736e8c16" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD CONSTRAINT "FK_881c0cf438d9d314dc10aba3f8f" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP CONSTRAINT "FK_881c0cf438d9d314dc10aba3f8f"`);
        await queryRunner.query(`ALTER TABLE "reglas" DROP CONSTRAINT "FK_412ebf60794edb34945736e8c16"`);
        await queryRunner.query(`ALTER TABLE "reglas" DROP CONSTRAINT "FK_bf9c08aa8980dccb564895721d5"`);
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_4dbb6c18b54a48fb3d7072cad5e"`);
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_f66e547b5ff945b8eb4512aa58c"`);
        await queryRunner.query(`ALTER TABLE "tipos_producto" DROP CONSTRAINT "FK_4d5b32ec25387175664fa3fa286"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_5f4dc9b4cf1f7993658c5c22927"`);
        await queryRunner.query(`DROP TABLE "recomendaciones"`);
        await queryRunner.query(`DROP TABLE "reglas"`);
        await queryRunner.query(`DROP TYPE "public"."reglas_tipo_valor_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reglas_operador_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reglas_parametro_enum"`);
        await queryRunner.query(`DROP TABLE "productos"`);
        await queryRunner.query(`DROP TABLE "tipos_producto"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "clientes"`);
    }

}
