import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertMasterDataInDB1674871204562 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO certification (name, description) VALUES ('atp', 'Private, Commercial or ATP'), ('cfi', 'Certified Flight Instructor (CFI)'), ('purple', 'Instrument Rated'), ('professional', 'Professional Pilot (other than a CFI)'), ('dpe', 'Designated Pilot Examiner (DPE)'), ('other', 'Other')`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
