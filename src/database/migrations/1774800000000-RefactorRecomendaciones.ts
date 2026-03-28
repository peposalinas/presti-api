import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorRecomendaciones1774800000000 implements MigrationInterface {
  name = 'RefactorRecomendaciones1774800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Quitar fechaNacimiento de la tabla usuarios
    await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "fechaNacimiento"`);

    // Hacer exito nullable en recomendaciones (quitar NOT NULL y default false)
    await queryRunner.query(`ALTER TABLE "recomendaciones" ALTER COLUMN "exito" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "recomendaciones" ALTER COLUMN "exito" SET DEFAULT NULL`);
    await queryRunner.query(`UPDATE "recomendaciones" SET "exito" = NULL WHERE "exito" = false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "recomendaciones" SET "exito" = false WHERE "exito" IS NULL`);
    await queryRunner.query(`ALTER TABLE "recomendaciones" ALTER COLUMN "exito" SET DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "recomendaciones" ALTER COLUMN "exito" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "usuarios" ADD COLUMN "fechaNacimiento" date NOT NULL DEFAULT '1900-01-01'`);
  }
}
