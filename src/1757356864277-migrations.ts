import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1757356864277 implements MigrationInterface {
    name = 'Migrations1757356864277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_8bf09ba754322ab9c22a215c919" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_8bf09ba754322ab9c22a215c919"`);
    }

}
