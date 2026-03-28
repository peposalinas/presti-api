import { MigrationInterface, QueryRunner } from "typeorm";

export class ReglasTipoProducto1774712115133 implements MigrationInterface {
    name = 'ReglasTipoProducto1774712115133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD "producto_id" uuid`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD "usuario_id" character varying(11)`);
        await queryRunner.query(`ALTER TABLE "reglas" ADD "tipo_producto_id" uuid`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP CONSTRAINT "FK_881c0cf438d9d314dc10aba3f8f"`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ALTER COLUMN "cliente_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reglas" DROP CONSTRAINT "FK_bf9c08aa8980dccb564895721d5"`);
        await queryRunner.query(`ALTER TABLE "reglas" ALTER COLUMN "producto_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reglas" ADD CONSTRAINT "CHK_a5f981f5cb3b6a902ea9c7adab" CHECK (("producto_id" IS NOT NULL AND "tipo_producto_id" IS NULL)
     OR ("producto_id" IS NULL AND "tipo_producto_id" IS NOT NULL))`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD CONSTRAINT "FK_881c0cf438d9d314dc10aba3f8f" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD CONSTRAINT "FK_6176b37c13066c0e253d79fa934" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD CONSTRAINT "FK_69d2de87f45650a2d59d4ccecf6" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("cuil") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reglas" ADD CONSTRAINT "FK_bf9c08aa8980dccb564895721d5" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reglas" ADD CONSTRAINT "FK_52d5983ab27bf1ee055235bfd6e" FOREIGN KEY ("tipo_producto_id") REFERENCES "tipos_producto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reglas" DROP CONSTRAINT "FK_52d5983ab27bf1ee055235bfd6e"`);
        await queryRunner.query(`ALTER TABLE "reglas" DROP CONSTRAINT "FK_bf9c08aa8980dccb564895721d5"`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP CONSTRAINT "FK_69d2de87f45650a2d59d4ccecf6"`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP CONSTRAINT "FK_6176b37c13066c0e253d79fa934"`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP CONSTRAINT "FK_881c0cf438d9d314dc10aba3f8f"`);
        await queryRunner.query(`ALTER TABLE "reglas" DROP CONSTRAINT "CHK_a5f981f5cb3b6a902ea9c7adab"`);
        await queryRunner.query(`ALTER TABLE "reglas" ALTER COLUMN "producto_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reglas" ADD CONSTRAINT "FK_bf9c08aa8980dccb564895721d5" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ALTER COLUMN "cliente_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" ADD CONSTRAINT "FK_881c0cf438d9d314dc10aba3f8f" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reglas" DROP COLUMN "tipo_producto_id"`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP COLUMN "usuario_id"`);
        await queryRunner.query(`ALTER TABLE "recomendaciones" DROP COLUMN "producto_id"`);
    }

}
