import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductoAndUsuarioToRecomendaciones1774708376615 implements MigrationInterface {
    name = 'AddProductoAndUsuarioToRecomendaciones1774708376615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD "producto_id" uuid`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD "usuario_id" character varying(11)`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP CONSTRAINT "FK_881c0cf438d9d314dc10aba3f8f"`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ALTER COLUMN "cliente_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD CONSTRAINT "FK_881c0cf438d9d314dc10aba3f8f" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD CONSTRAINT "FK_6176b37c13066c0e253d79fa934" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD CONSTRAINT "FK_69d2de87f45650a2d59d4ccecf6" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("cuil") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP CONSTRAINT "FK_69d2de87f45650a2d59d4ccecf6"`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP CONSTRAINT "FK_6176b37c13066c0e253d79fa934"`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP CONSTRAINT "FK_881c0cf438d9d314dc10aba3f8f"`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ALTER COLUMN "cliente_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD CONSTRAINT "FK_881c0cf438d9d314dc10aba3f8f" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP COLUMN "usuario_id"`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP COLUMN "producto_id"`);
    }

}
