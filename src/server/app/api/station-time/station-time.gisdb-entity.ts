import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('fcst_hr_stat_map')
export class StationTime {
  @PrimaryColumn()
  station_table_name: string;

  @Column()
  valid_date: Date;
}
