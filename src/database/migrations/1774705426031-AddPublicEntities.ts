import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPublicEntities1774705426031 implements MigrationInterface {
    name = 'AddPublicEntities1774705426031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "deuda_entidad" ("id" SERIAL NOT NULL, "deuda_periodo_id" integer NOT NULL, "entidad" character varying(255) NOT NULL, "situacion" smallint NOT NULL, "fecha_sit1" date, "monto" numeric(15,2) NOT NULL, "dias_atraso_pago" integer, "refinanciaciones" boolean NOT NULL DEFAULT false, "recategorizacion_oblig" boolean NOT NULL DEFAULT false, "situacion_juridica" boolean NOT NULL DEFAULT false, "irrec_disposicion_tecnica" boolean NOT NULL DEFAULT false, "en_revision" boolean NOT NULL DEFAULT false, "proceso_jud" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_f66feed53989082614d27526572" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "deuda_periodo" ("id" SERIAL NOT NULL, "identificacion" bigint NOT NULL, "periodo" character varying(6) NOT NULL, "fetched_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_9fc8d264c7910956a3f9b555f8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_474f3ebf6d86b49d2ee5bc02ca" ON "deuda_periodo" ("identificacion", "periodo") `);
        await queryRunner.query(`CREATE TABLE "deuda_historica_entidad" ("id" SERIAL NOT NULL, "deuda_hist_periodo_id" integer NOT NULL, "entidad" character varying(255) NOT NULL, "situacion" smallint NOT NULL, "monto" numeric(15,2) NOT NULL, "en_revision" boolean NOT NULL DEFAULT false, "proceso_jud" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_8c5282aa548e6b9dd7d3859882c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "deuda_historica_periodo" ("id" SERIAL NOT NULL, "identificacion" bigint NOT NULL, "periodo" character varying(6) NOT NULL, "fetched_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_9f9b3fb554f432de07aa40c959b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a1f9ff016ef0090bf6894d30ba" ON "deuda_historica_periodo" ("identificacion", "periodo") `);
        await queryRunner.query(`CREATE TABLE "persona" ("identificacion" bigint NOT NULL, "denominacion" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cd9577a78e7334321f9abc96cb4" PRIMARY KEY ("identificacion"))`);
        await queryRunner.query(`CREATE TABLE "cheque_rechazado" ("id" SERIAL NOT NULL, "identificacion" bigint NOT NULL, "causal" character varying(100) NOT NULL, "entidad" integer NOT NULL, "nro_cheque" integer NOT NULL, "fecha_rechazo" date NOT NULL, "monto" numeric(15,2) NOT NULL, "fecha_pago" date, "fecha_pago_multa" date, "estado_multa" character varying(50), "cta_personal" boolean NOT NULL DEFAULT false, "denom_juridica" character varying(255), "en_revision" boolean NOT NULL DEFAULT false, "proceso_jud" boolean NOT NULL DEFAULT false, "fetched_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_b1dfc98e228e80c153d67fb8522" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_816fd47d37354b2014b543f7ed" ON "cheque_rechazado" ("identificacion", "fecha_rechazo") `);
        await queryRunner.query(`ALTER TABLE "deuda_entidad" ADD CONSTRAINT "FK_c3322dd05d3aaaf949db1148a2b" FOREIGN KEY ("deuda_periodo_id") REFERENCES "deuda_periodo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deuda_periodo" ADD CONSTRAINT "FK_86355229d05a445911ad63ca6f1" FOREIGN KEY ("identificacion") REFERENCES "persona"("identificacion") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deuda_historica_entidad" ADD CONSTRAINT "FK_de22db6e1cd01804c6fef1e7eda" FOREIGN KEY ("deuda_hist_periodo_id") REFERENCES "deuda_historica_periodo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deuda_historica_periodo" ADD CONSTRAINT "FK_a8b19ad6f768bbf0161171be805" FOREIGN KEY ("identificacion") REFERENCES "persona"("identificacion") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cheque_rechazado" ADD CONSTRAINT "FK_352762d805899c80fa8cd0fe3c0" FOREIGN KEY ("identificacion") REFERENCES "persona"("identificacion") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cheque_rechazado" DROP CONSTRAINT "FK_352762d805899c80fa8cd0fe3c0"`);
        await queryRunner.query(`ALTER TABLE "deuda_historica_periodo" DROP CONSTRAINT "FK_a8b19ad6f768bbf0161171be805"`);
        await queryRunner.query(`ALTER TABLE "deuda_historica_entidad" DROP CONSTRAINT "FK_de22db6e1cd01804c6fef1e7eda"`);
        await queryRunner.query(`ALTER TABLE "deuda_periodo" DROP CONSTRAINT "FK_86355229d05a445911ad63ca6f1"`);
        await queryRunner.query(`ALTER TABLE "deuda_entidad" DROP CONSTRAINT "FK_c3322dd05d3aaaf949db1148a2b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_816fd47d37354b2014b543f7ed"`);
        await queryRunner.query(`DROP TABLE "cheque_rechazado"`);
        await queryRunner.query(`DROP TABLE "persona"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a1f9ff016ef0090bf6894d30ba"`);
        await queryRunner.query(`DROP TABLE "deuda_historica_periodo"`);
        await queryRunner.query(`DROP TABLE "deuda_historica_entidad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_474f3ebf6d86b49d2ee5bc02ca"`);
        await queryRunner.query(`DROP TABLE "deuda_periodo"`);
        await queryRunner.query(`DROP TABLE "deuda_entidad"`);
    }

}
