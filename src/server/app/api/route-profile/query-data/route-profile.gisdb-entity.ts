import { Column, Entity, PrimaryColumn } from 'typeorm';

export interface AggregatedMapping {
  filename: string;
  bands: string[];
  elevations: number[];
}

@Entity('cat_mapping')
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

@Entity('mwturb_mapping')
export class Mwturb {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('gfs_humidity_mapping')
export class GfsHumidity {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('gfs_temperature_mapping')
export class GfsTemperature {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}
@Entity('gfs_windspeed_mapping')
export class GfsWindSpeed {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('gfs_winddirection_mapping')
export class GfsWindDirection {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}
