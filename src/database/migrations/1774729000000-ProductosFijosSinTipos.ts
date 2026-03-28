import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductosFijosSinTipos1774729000000 implements MigrationInterface {
  name = "ProductosFijosSinTipos1774729000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."productos_tipo_enum" AS ENUM('PRESTAMO', 'MICROPRESTAMO', 'TARJETA_CREDITO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "tipo" "public"."productos_tipo_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "tasa_min" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "tasa_max" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "monto_min" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "monto_max" double precision`,
    );
    await queryRunner.query(`ALTER TABLE "productos" ADD "cuotas_min" integer`);
    await queryRunner.query(`ALTER TABLE "productos" ADD "cuotas_max" integer`);
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "limite_cuotas_min" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "limite_cuotas_max" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "limite_monto_total_min" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "limite_monto_total_max" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "interes_min" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "interes_max" double precision`,
    );

    await queryRunner.query(`
          UPDATE "productos" p
          SET "tipo" = CASE
            WHEN tp."nombre" ILIKE '%micro%' THEN 'MICROPRESTAMO'::"public"."productos_tipo_enum"
            WHEN tp."nombre" ILIKE '%tarjeta%' THEN 'TARJETA_CREDITO'::"public"."productos_tipo_enum"
            ELSE 'PRESTAMO'::"public"."productos_tipo_enum"
          END
          FROM "tipos_producto" tp
          WHERE p."tipo_producto_id" = tp."id"
        `);

    await queryRunner.query(
      `UPDATE "productos" SET "tipo" = 'PRESTAMO' WHERE "tipo" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ALTER COLUMN "tipo" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ALTER COLUMN "tipo" SET DEFAULT 'PRESTAMO'`,
    );

    await queryRunner.query(`
          UPDATE "productos"
          SET
            "tasa_min" = COALESCE("tasa_min", 0),
            "tasa_max" = COALESCE("tasa_max", 0),
            "monto_min" = COALESCE("monto_min", 0),
            "monto_max" = COALESCE("monto_max", 0),
            "cuotas_min" = COALESCE("cuotas_min", 1),
            "cuotas_max" = COALESCE("cuotas_max", 1)
          WHERE "tipo" IN ('PRESTAMO', 'MICROPRESTAMO')
        `);

    await queryRunner.query(`
          UPDATE "productos"
          SET
            "limite_cuotas_min" = COALESCE("limite_cuotas_min", 1),
            "limite_cuotas_max" = COALESCE("limite_cuotas_max", 1),
            "limite_monto_total_min" = COALESCE("limite_monto_total_min", 0),
            "limite_monto_total_max" = COALESCE("limite_monto_total_max", 0),
            "interes_min" = COALESCE("interes_min", 0),
            "interes_max" = COALESCE("interes_max", 0)
          WHERE "tipo" = 'TARJETA_CREDITO'
        `);

    await queryRunner.query(`
          UPDATE "reglas" r
          SET "producto_id" = (
            SELECT p."id"
            FROM "productos" p
            WHERE p."tipo_producto_id" = r."tipo_producto_id"
            ORDER BY p."id"
            LIMIT 1
          )
          WHERE r."producto_id" IS NULL
            AND r."tipo_producto_id" IS NOT NULL
        `);

    await queryRunner.query(`DELETE FROM "reglas" WHERE "producto_id" IS NULL`);

    await queryRunner.query(`
          WITH ranked AS (
            SELECT
              p."id",
              p."cliente_id",
              p."tipo",
              FIRST_VALUE(p."id") OVER (PARTITION BY p."cliente_id", p."tipo" ORDER BY p."id") AS "keeper_id",
              ROW_NUMBER() OVER (PARTITION BY p."cliente_id", p."tipo" ORDER BY p."id") AS "rn"
            FROM "productos" p
          ),
          to_update AS (
            SELECT r."id", r."keeper_id"
            FROM ranked r
            WHERE r."rn" > 1
          )
          UPDATE "reglas" rg
          SET "producto_id" = tu."keeper_id"
          FROM to_update tu
          WHERE rg."producto_id" = tu."id"
        `);

    await queryRunner.query(`
          WITH ranked AS (
            SELECT
              p."id",
              p."cliente_id",
              p."tipo",
              FIRST_VALUE(p."id") OVER (PARTITION BY p."cliente_id", p."tipo" ORDER BY p."id") AS "keeper_id",
              ROW_NUMBER() OVER (PARTITION BY p."cliente_id", p."tipo" ORDER BY p."id") AS "rn"
            FROM "productos" p
          ),
          to_update AS (
            SELECT r."id", r."keeper_id"
            FROM ranked r
            WHERE r."rn" > 1
          )
          UPDATE "recomendaciones" rec
          SET "producto_id" = tu."keeper_id"
          FROM to_update tu
          WHERE rec."producto_id" = tu."id"
        `);

    await queryRunner.query(`
          WITH ranked AS (
            SELECT
              p."id",
              p."cliente_id",
              p."tipo",
              ROW_NUMBER() OVER (PARTITION BY p."cliente_id", p."tipo" ORDER BY p."id") AS "rn"
            FROM "productos" p
          ),
          to_delete AS (
            SELECT r."id"
            FROM ranked r
            WHERE r."rn" > 1
          )
          DELETE FROM "productos" p
          USING to_delete td
          WHERE p."id" = td."id"
        `);

    await queryRunner.query(
      `ALTER TABLE "reglas" DROP CONSTRAINT IF EXISTS "CHK_a5f981f5cb3b6a902ea9c7adab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reglas" DROP CONSTRAINT IF EXISTS "FK_52d5983ab27bf1ee055235bfd6e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reglas" DROP COLUMN "tipo_producto_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reglas" ALTER COLUMN "producto_id" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "productos" DROP CONSTRAINT IF EXISTS "FK_f66e547b5ff945b8eb4512aa58c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN "tipo_producto_id"`,
    );

    await queryRunner.query(`DROP TABLE "tipos_producto"`);

    await queryRunner.query(
      `ALTER TABLE "productos" ADD CONSTRAINT "UQ_productos_cliente_tipo" UNIQUE ("cliente_id", "tipo")`,
    );

    await queryRunner.query(
      `ALTER TABLE "productos" ADD CONSTRAINT "CHK_productos_tasa_rango" CHECK (("tasa_min" IS NULL OR "tasa_max" IS NULL OR "tasa_min" <= "tasa_max"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD CONSTRAINT "CHK_productos_monto_rango" CHECK (("monto_min" IS NULL OR "monto_max" IS NULL OR "monto_min" <= "monto_max"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD CONSTRAINT "CHK_productos_cuotas_rango" CHECK (("cuotas_min" IS NULL OR "cuotas_max" IS NULL OR "cuotas_min" <= "cuotas_max"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD CONSTRAINT "CHK_productos_limite_cuotas_rango" CHECK (("limite_cuotas_min" IS NULL OR "limite_cuotas_max" IS NULL OR "limite_cuotas_min" <= "limite_cuotas_max"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD CONSTRAINT "CHK_productos_limite_monto_total_rango" CHECK (("limite_monto_total_min" IS NULL OR "limite_monto_total_max" IS NULL OR "limite_monto_total_min" <= "limite_monto_total_max"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD CONSTRAINT "CHK_productos_interes_rango" CHECK (("interes_min" IS NULL OR "interes_max" IS NULL OR "interes_min" <= "interes_max"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "productos" DROP CONSTRAINT IF EXISTS "UQ_productos_cliente_tipo"`,
    );

    await queryRunner.query(
      `ALTER TABLE "productos" DROP CONSTRAINT IF EXISTS "CHK_productos_interes_rango"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP CONSTRAINT IF EXISTS "CHK_productos_limite_monto_total_rango"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP CONSTRAINT IF EXISTS "CHK_productos_limite_cuotas_rango"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP CONSTRAINT IF EXISTS "CHK_productos_cuotas_rango"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP CONSTRAINT IF EXISTS "CHK_productos_monto_rango"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP CONSTRAINT IF EXISTS "CHK_productos_tasa_rango"`,
    );

    await queryRunner.query(
      `CREATE TABLE "tipos_producto" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "cliente_id" uuid NOT NULL, CONSTRAINT "PK_58618d40dce38bc9c6a610386fa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tipos_producto" ADD CONSTRAINT "FK_4d5b32ec25387175664fa3fa286" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
          INSERT INTO "tipos_producto" ("nombre", "cliente_id")
          SELECT DISTINCT
            CASE
              WHEN p."tipo" = 'MICROPRESTAMO' THEN 'Microprestamo'
              WHEN p."tipo" = 'TARJETA_CREDITO' THEN 'Tarjeta de credito'
              ELSE 'Prestamo'
            END,
            p."cliente_id"
          FROM "productos" p
        `);

    await queryRunner.query(
      `ALTER TABLE "productos" ADD "tipo_producto_id" uuid`,
    );

    await queryRunner.query(`
          UPDATE "productos" p
          SET "tipo_producto_id" = tp."id"
          FROM "tipos_producto" tp
          WHERE tp."cliente_id" = p."cliente_id"
            AND tp."nombre" = CASE
              WHEN p."tipo" = 'MICROPRESTAMO' THEN 'Microprestamo'
              WHEN p."tipo" = 'TARJETA_CREDITO' THEN 'Tarjeta de credito'
              ELSE 'Prestamo'
            END
        `);

    await queryRunner.query(
      `ALTER TABLE "productos" ALTER COLUMN "tipo_producto_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD CONSTRAINT "FK_f66e547b5ff945b8eb4512aa58c" FOREIGN KEY ("tipo_producto_id") REFERENCES "tipos_producto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`ALTER TABLE "reglas" ADD "tipo_producto_id" uuid`);
    await queryRunner.query(`
          UPDATE "reglas" r
          SET "tipo_producto_id" = p."tipo_producto_id"
          FROM "productos" p
          WHERE r."producto_id" = p."id"
        `);

    await queryRunner.query(
      `ALTER TABLE "reglas" ALTER COLUMN "producto_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "reglas" SET "producto_id" = NULL WHERE "tipo_producto_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reglas" ADD CONSTRAINT "FK_52d5983ab27bf1ee055235bfd6e" FOREIGN KEY ("tipo_producto_id") REFERENCES "tipos_producto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reglas" ADD CONSTRAINT "CHK_a5f981f5cb3b6a902ea9c7adab" CHECK (("producto_id" IS NOT NULL AND "tipo_producto_id" IS NULL) OR ("producto_id" IS NULL AND "tipo_producto_id" IS NOT NULL))`,
    );

    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN "interes_max"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN "interes_min"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN "limite_monto_total_max"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN "limite_monto_total_min"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN "limite_cuotas_max"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN "limite_cuotas_min"`,
    );
    await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "cuotas_max"`);
    await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "cuotas_min"`);
    await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "monto_max"`);
    await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "monto_min"`);
    await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "tasa_max"`);
    await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "tasa_min"`);
    await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "tipo"`);
    await queryRunner.query(`DROP TYPE "public"."productos_tipo_enum"`);
  }
}
