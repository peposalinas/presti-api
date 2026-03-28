import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApiKeysTable1774850000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "api_key" UUID NOT NULL,
        "cliente_id" UUID NOT NULL,
        "activo" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "PK_api_keys" PRIMARY KEY ("api_key"),
        CONSTRAINT "FK_api_keys_cliente" FOREIGN KEY ("cliente_id")
          REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "api_keys"`);
  }
}
