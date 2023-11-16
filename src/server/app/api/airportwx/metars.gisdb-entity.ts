import { Column, Entity, PrimaryColumn } from 'typeorm';

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
