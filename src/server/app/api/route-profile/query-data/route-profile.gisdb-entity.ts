import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('cat')
export class ClearAirTurb {
  @PrimaryColumn()
  fid: number;

  @Column()
  location: string;

  @Column()
  ingestion: Date;

  @Column()
  elevation: number;
}

@Entity('nbm_cloudceiling')
export class Ceiling {
  @PrimaryColumn()
  fid: number;

  @Column()
  location: string;

  @Column()
  ingestion: Date;
}

@Entity('nbm_vis')
export class Visibility {
  @PrimaryColumn()
  fid: number;

  @Column()
  location: string;

  @Column()
  ingestion: Date;
}
