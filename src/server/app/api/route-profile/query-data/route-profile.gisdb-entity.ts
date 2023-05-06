import { Column, Entity, PrimaryColumn } from 'typeorm';

export interface AggregatedMapping {
  filename: string;
  times: string[];
  bands: string[];
  elevations: number[];
}

export abstract class RasterMapping {
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

@Entity('cat_mapping')
export class ClearAirTurb extends RasterMapping {}

@Entity('mwturb_mapping')
export class Mwturb extends RasterMapping {}

@Entity('gfs_humidity_mapping')
export class GfsHumidity extends RasterMapping {}

@Entity('gfs_temperature_mapping')
export class GfsTemperature extends RasterMapping {}
@Entity('gfs_windspeed_mapping')
export class GfsWindSpeed extends RasterMapping {}

@Entity('gfs_winddirection_mapping')
export class GfsWindDirection extends RasterMapping {}
@Entity('icingprob_mapping')
export class IcingProb extends RasterMapping {}

@Entity('icingsev_mapping')
export class IcingSev extends RasterMapping {}

@Entity('icingsld_mapping')
export class IcingSld extends RasterMapping {}

@Entity('nbm_cloudbase')
export class NbmCloudbase extends RasterMapping {}

@Entity('nbm_cloudceiling')
export class NbmCloudceiling extends RasterMapping {}

@Entity('nbm_dewp')
export class NbmDewpoint extends RasterMapping {}

@Entity('nbm_gust')
export class NbmGust extends RasterMapping {}

@Entity('nbm_skycov')
export class NbmSkycover extends RasterMapping {}

@Entity('nbm_temp')
export class NbmT2m extends RasterMapping {}

@Entity('nbm_vis')
export class NbmVis extends RasterMapping {}

@Entity('nbm_wdir')
export class NbmWindDirection extends RasterMapping {}

@Entity('nbm_wspeed')
export class NbmWindSpeed extends RasterMapping {}
