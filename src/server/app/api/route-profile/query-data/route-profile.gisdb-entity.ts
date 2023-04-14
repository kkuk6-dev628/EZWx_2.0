import { Column, Entity, PrimaryColumn } from 'typeorm';

export interface AggregatedMapping {
  filename: string;
  bands: string[];
  elevations: number[];
}

@Entity('cat')
export class ClearAirTurb {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  band: string;

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
