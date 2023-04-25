import { Column, Entity, PrimaryColumn } from 'typeorm';

export interface AggregatedMapping {
  filename: string;
  times: string[];
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
  time: string;

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
  time: string;

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
  time: string;

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
  time: string;

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
  time: string;

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
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('icingprob_mapping')
export class IcingProb {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('icingsev_mapping')
export class IcingSev {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('icingsld_mapping')
export class IcingSld {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('nbm_cloudbase')
export class NbmCloudbase {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('nbm_cloudceiling')
export class NbmCloudceiling {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('nbm_dewpoint2m_mapping')
export class NbmDewpoint {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('nbm_gust10m_mapping')
export class NbmGust {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('nbm_skycover_mapping')
export class NbmSkycover {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('nbm_tem2m_mapping')
export class NbmT2m {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('nbm_vis_mapping')
export class NbmVis {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('nbm_wd10_mapping')
export class NbmWindDirection {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}

@Entity('nbm_ws10_mapping')
export class NbmWindSpeed {
  @PrimaryColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  time: string;

  @Column()
  band: string;

  @Column()
  elevation: number;
}
