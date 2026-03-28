import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalApisEntities1774701086452 implements MigrationInterface {
    name = 'AddExternalApisEntities1774701086452'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "personas" ("cuil" character varying(11) NOT NULL, "sexo_inferido" character varying(1), "edad_estimada" integer, "fecha_origen_situacion_1" date, "mejor_situacion" integer, "peor_situacion" integer, CONSTRAINT "PK_1535e499bbd5547ffaea0bd2012" PRIMARY KEY ("cuil"))`);
        await queryRunner.query(`CREATE TABLE "historial_crediticio" ("cuil" character varying(11) NOT NULL, "codigo_entidad" integer NOT NULL, "periodo" character varying(6) NOT NULL, "situacion" integer NOT NULL, "monto" numeric(15,2), "proceso_judicial" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_91769e94080887f34cc6dfb21e7" PRIMARY KEY ("cuil", "codigo_entidad", "periodo"))`);
        await queryRunner.query(`CREATE TYPE "public"."entidades_tipo_entidad_enum" AS ENUM('banco_publico', 'banco_privado', 'fintech', 'tarjeta', 'cooperativa', 'mutual', 'otro')`);
        await queryRunner.query(`CREATE TABLE "entidades" ("codigo_entidad" integer NOT NULL, "nombre_entidad" character varying(255) NOT NULL, "tipo_entidad" "public"."entidades_tipo_entidad_enum", CONSTRAINT "PK_50436b822051c953c51c30bf57d" PRIMARY KEY ("codigo_entidad"))`);
        await queryRunner.query(`CREATE TABLE "deudas_actuales" ("cuil" character varying(11) NOT NULL, "codigo_entidad" integer NOT NULL, "periodo" character varying(6) NOT NULL, "situacion" integer NOT NULL, "monto_prestamos" numeric(15,2), "garantias_otorgadas" numeric(15,2), "dias_atraso" integer, "refinanciaciones" boolean NOT NULL DEFAULT false, "recategorizacion_obligatoria" boolean NOT NULL DEFAULT false, "situacion_juridica" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_33c8be97408367d3ee7f58c417e" PRIMARY KEY ("cuil", "codigo_entidad"))`);
        await queryRunner.query(`ALTER TABLE "historial_crediticio" ADD CONSTRAINT "FK_199650101a3e8035703db50d342" FOREIGN KEY ("cuil") REFERENCES "personas"("cuil") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historial_crediticio" ADD CONSTRAINT "FK_71df556100c357d58445b675eba" FOREIGN KEY ("codigo_entidad") REFERENCES "entidades"("codigo_entidad") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deudas_actuales" ADD CONSTRAINT "FK_904665050a77a747d26a7f1df03" FOREIGN KEY ("cuil") REFERENCES "personas"("cuil") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deudas_actuales" ADD CONSTRAINT "FK_4a649fe3ff6cc77f68f4015bd1d" FOREIGN KEY ("codigo_entidad") REFERENCES "entidades"("codigo_entidad") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "deudas_actuales" DROP CONSTRAINT "FK_4a649fe3ff6cc77f68f4015bd1d"`);
        await queryRunner.query(`ALTER TABLE "deudas_actuales" DROP CONSTRAINT "FK_904665050a77a747d26a7f1df03"`);
        await queryRunner.query(`ALTER TABLE "historial_crediticio" DROP CONSTRAINT "FK_71df556100c357d58445b675eba"`);
        await queryRunner.query(`ALTER TABLE "historial_crediticio" DROP CONSTRAINT "FK_199650101a3e8035703db50d342"`);
        await queryRunner.query(`DROP TABLE "deudas_actuales"`);
        await queryRunner.query(`DROP TABLE "entidades"`);
        await queryRunner.query(`DROP TYPE "public"."entidades_tipo_entidad_enum"`);
        await queryRunner.query(`DROP TABLE "historial_crediticio"`);
        await queryRunner.query(`DROP TABLE "personas"`);
    }

}
