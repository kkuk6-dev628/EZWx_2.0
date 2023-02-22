import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('station_time')
export class StationTime {
  @PrimaryColumn()
  station_table_name: string;

  @Column()
  valid_date: Date;
}
