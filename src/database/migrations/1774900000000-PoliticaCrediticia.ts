import { MigrationInterface, QueryRunner } from 'typeorm';

export class PoliticaCrediticia1774900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla politicas_crediticias
    await queryRunner.query(`
      CREATE TABLE "politicas_crediticias" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "max_situacion_crediticia_permitida" smallint NOT NULL DEFAULT 2,
        "max_entidades_con_deuda" integer NOT NULL DEFAULT 3,
        "max_deuda_total_externa" numeric(15,2) NOT NULL DEFAULT 350000,
        "meses_historial_limpio_requerido" integer NOT NULL DEFAULT 6,
        "cliente_id" uuid NOT NULL,
        CONSTRAINT "PK_politicas_crediticias" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_politicas_crediticias_cliente" UNIQUE ("cliente_id"),
        CONSTRAINT "FK_politicas_crediticias_cliente" FOREIGN KEY ("cliente_id")
          REFERENCES "clientes"("id") ON DELETE CASCADE
      )
    `);

    // 2. Insertar política con valores default para clientes existentes
    await queryRunner.query(`
      INSERT INTO "politicas_crediticias" ("cliente_id")
      SELECT "id" FROM "clientes"
    `);

    // 3. Eliminar tabla reglas
    await queryRunner.query(`DROP TABLE IF EXISTS "reglas"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "politicas_crediticias"`);

    await queryRunner.query(`
      CREATE TABLE "reglas" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "parametro" character varying NOT NULL,
        "operador" character varying NOT NULL,
        "valor" text NOT NULL,
        "tipo_valor" character varying NOT NULL,
        "prioridad" integer NOT NULL,
        "producto_id" uuid NOT NULL,
        "cliente_id" uuid NOT NULL,
        CONSTRAINT "PK_reglas" PRIMARY KEY ("id")
      )
    `);
  }
}
