import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('forecast_hr_to_stations_table_map')
export class StationTime {
  @PrimaryColumn()
  station_table_name: string;

  @Column()
  valid_date: Date;
}
