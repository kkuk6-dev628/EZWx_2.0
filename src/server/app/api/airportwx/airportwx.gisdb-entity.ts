import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('metar')
export class Metar {
  @PrimaryColumn()
  index: number;

  @Column()
  station_id: string;

  @Column()
  observation_time: Date;

  @Column()
  raw_text: string;
}

@Entity('taf')
export class Taf {
  @PrimaryColumn()
  index: number;

  @Column()
  station_id: string;

  @Column()
  issue_time: Date;

  @Column()
  raw_text: string;
}

@Entity('afd')
export class Afd {
  @PrimaryColumn()
  afd_name: string;

  @Column()
  afd_content: string;
}

@Entity('county_warning_areas')
export class CountyWarningAreas {
  @PrimaryColumn()
  gid: number;

  @Column()
  cwa: string;

  @Column()
  wfo: string;

  @Column()
  lon: string;

  @Column()
  lat: string;

  @Column()
  region: string;

  @Column()
  fullstaid: string;

  @Column()
  citystate: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  st: string;
}
