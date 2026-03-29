import { MigrationInterface, QueryRunner } from 'typeorm';

export class Cartera1774910000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "consultas_usuario" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "cliente_id" uuid NOT NULL,
        "cuil" varchar(11) NOT NULL,
        "situacion" smallint,
        "ultima_consulta_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_consultas_usuario" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_consultas_usuario_cliente_cuil" UNIQUE ("cliente_id", "cuil"),
        CONSTRAINT "FK_consultas_usuario_cliente" FOREIGN KEY ("cliente_id")
          REFERENCES "clientes"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cambios_situacion" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "cliente_id" uuid NOT NULL,
        "cuil" varchar(11) NOT NULL,
        "situacion_anterior" smallint NOT NULL,
        "situacion_nueva" smallint NOT NULL,
        "detectado_at" timestamp NOT NULL,
        CONSTRAINT "PK_cambios_situacion" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cambios_situacion_cliente" FOREIGN KEY ("cliente_id")
          REFERENCES "clientes"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cambios_situacion_cliente_fecha"
        ON "cambios_situacion" ("cliente_id", "detectado_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cambios_situacion_cliente_fecha"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cambios_situacion"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "consultas_usuario"`);
  }
}
