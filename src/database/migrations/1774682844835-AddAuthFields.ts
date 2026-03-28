import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthFields1774682844835 implements MigrationInterface {
    name = 'AddAuthFields1774682844835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clientes" ADD "email" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clientes" ADD CONSTRAINT "UQ_3cd5652ab34ca1a0a2c7a255313" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "clientes" ADD "password" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clientes" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "clientes" DROP CONSTRAINT "UQ_3cd5652ab34ca1a0a2c7a255313"`);
        await queryRunner.query(`ALTER TABLE "clientes" DROP COLUMN "email"`);
    }

}
