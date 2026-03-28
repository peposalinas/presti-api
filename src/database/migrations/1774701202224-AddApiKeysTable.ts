import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApiKeysTable1774701202224 implements MigrationInterface {
    name = 'AddApiKeysTable1774701202224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "api_keys" ("api_key" uuid NOT NULL, "cliente_id" uuid NOT NULL, "activo" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_9ccce5863aec84d045d778179de" PRIMARY KEY ("api_key"))`);
        await queryRunner.query(`ALTER TABLE "api_keys" ADD CONSTRAINT "FK_658714fddd8a5cf645e4c539cf0" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_keys" DROP CONSTRAINT "FK_658714fddd8a5cf645e4c539cf0"`);
        await queryRunner.query(`DROP TABLE "api_keys"`);
    }

}
