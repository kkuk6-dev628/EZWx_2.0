import { Injectable } from '@nestjs/common';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  AggregatedMapping,
  ClearAirTurb,
  GfsHumidity,
  GfsTemperature,
  GfsWindDirection,
  GfsWindSpeed,
  IcingProb,
  IcingSev,
  IcingSld,
  Mwturb,
  NbmCloudbase,
  NbmCloudceiling,
  NbmDewpoint,
  NbmGust,
  NbmSkycover,
  NbmT2m,
  NbmVis,
  NbmWindDirection,
  NbmWindSpeed,
  NbmWx1,
  NbmWx2,
  NbmWxInten1,
  NbmWxInten2,
  NbmWxProbCov1,
  NbmWxProbCov2,
} from './route-profile.gisdb-entity';
import { RouteProfileQueryDto } from './route-profile-query.dto';
import { dynamicImport } from 'tsimportlib';

let geotiff;
let pool;

@Injectable()
export class RouteProfileQueryDataService {
  constructor(
    @InjectRepository(ClearAirTurb, 'gisDB')
    private clearAirTubRepository: Repository<ClearAirTurb>,
    @InjectRepository(Mwturb, 'gisDB')
    private mwturbRepository: Repository<Mwturb>,
    @InjectRepository(GfsHumidity, 'gisDB')
    private humidityRepository: Repository<GfsHumidity>,
    @InjectRepository(GfsTemperature, 'gisDB')
    private temperaturRepository: Repository<GfsTemperature>,
    @InjectRepository(GfsWindDirection, 'gisDB')
    private gfsWindDirectionRepository: Repository<GfsWindDirection>,
    @InjectRepository(GfsWindSpeed, 'gisDB')
    private gfsWindSpeedRepository: Repository<GfsWindSpeed>,
    @InjectRepository(IcingProb, 'gisDB')
    private icingProbRepository: Repository<IcingProb>,
    @InjectRepository(IcingSev, 'gisDB')
    private icingSevRepository: Repository<IcingSev>,
    @InjectRepository(IcingSld, 'gisDB')
    private icingSldRepository: Repository<IcingSld>,
    @InjectRepository(NbmCloudbase, 'gisDB')
    private nbmCloudBaseRepository: Repository<NbmCloudbase>,
    @InjectRepository(NbmCloudceiling, 'gisDB')
    private nbmCloudCeilingRepository: Repository<NbmCloudceiling>,
    @InjectRepository(NbmDewpoint, 'gisDB')
    private nbmDewpointRepository: Repository<NbmDewpoint>,
    @InjectRepository(NbmGust, 'gisDB')
    private nbmGustRepository: Repository<NbmGust>,
    @InjectRepository(NbmSkycover, 'gisDB')
    private nbmSkycoverRepository: Repository<NbmSkycover>,
    @InjectRepository(NbmT2m, 'gisDB')
    private nbmT2mRepository: Repository<NbmT2m>,
    @InjectRepository(NbmVis, 'gisDB')
    private nbmVisRepository: Repository<NbmVis>,
    @InjectRepository(NbmWindDirection, 'gisDB')
    private nbmWindDirectionRepository: Repository<NbmWindDirection>,
    @InjectRepository(NbmWindSpeed, 'gisDB')
    private nbmWindSpeedRepository: Repository<NbmWindSpeed>,
    @InjectRepository(NbmWx1, 'gisDB')
    private nbmWx1Repository: Repository<NbmWx1>,
    @InjectRepository(NbmWx2, 'gisDB')
    private nbmWx2Repository: Repository<NbmWx2>,
    @InjectRepository(NbmWxInten1, 'gisDB')
    private nbmWxInten1Repository: Repository<NbmWxInten1>,
    @InjectRepository(NbmWxInten2, 'gisDB')
    private nbmWxInten2Repository: Repository<NbmWxInten2>,
    @InjectRepository(NbmWxProbCov1, 'gisDB')
    private nbmWxProbCov1Repository: Repository<NbmWxProbCov1>,
    @InjectRepository(NbmWxProbCov2, 'gisDB')
    private nbmWxProbCov2Repository: Repository<NbmWxProbCov2>,
    @InjectDataSource('gisDB')
    private dataSource: DataSource,
  ) {}

  async queryRaster(positions: GeoJSON.Position[], rasterFileName: string, pool) {
    const file = await geotiff.fromFile(rasterFileName);
    const image = await file.getImage();
    const bbox = image.getBoundingBox();
    const pixelWidth = image.getWidth();
    const pixelHeight = image.getHeight();
    const bboxWidth = bbox[2] - bbox[0];
    const bboxHeight = bbox[3] - bbox[1];
    const results = [];
    for (const position of positions) {
      if (position === null) {
        results.push({ position, data: null });
        continue;
      }
      const widthPct = (position[0] - bbox[0]) / bboxWidth;
      const heightPct = (position[1] - bbox[1]) / bboxHeight;
      const xPx = Math.floor(pixelWidth * widthPct);
      const yPx = Math.floor(pixelHeight * (1 - heightPct));
      const window = [xPx, yPx, xPx + 1, yPx + 1];
      const data = await image.readRasters({ window, pool });
      results.push({ position, data: { ...data } });
    }
    return results;
  }

  async queryRasterDataset(queryPoints: GeoJSON.Position[], repository: Repository<any>) {
    if (!geotiff) {
      geotiff = (await dynamicImport('geotiff', module)) as typeof import('geotiff');
    }
    if (!pool) pool = new geotiff.Pool();

    const fileMappings = await repository
      .createQueryBuilder()
      .select([
        'filename',
        'array_agg (DISTINCT band) as bands',
        'array_agg (DISTINCT elevation) elevations',
        'array_agg (DISTINCT time) times',
      ])
      .groupBy('filename')
      .orderBy('filename')
      .getRawMany<AggregatedMapping>();

    const results = [];
    for (const fileMapping of fileMappings) {
      const data = await this.queryRaster(queryPoints, fileMapping.filename, pool);
      results.push({ time: fileMapping.times, data, elevations: fileMapping.elevations });
    }
    return results;
  }

  async queryRasterDatasetByElevations(
    queryPoints: GeoJSON.Position[],
    elevations: number[],
    repository: Repository<any>,
  ) {
    if (!geotiff) {
      geotiff = (await dynamicImport('geotiff', module)) as typeof import('geotiff');
    }
    if (!pool) pool = new geotiff.Pool();

    const fileMappings = await repository
      .createQueryBuilder()
      .select([
        'filename',
        'array_agg (DISTINCT band) as bands',
        'array_agg (DISTINCT elevation) elevations',
        'array_agg (DISTINCT time) times',
      ])
      .where('elevation IN (:...elevations)', {
        elevations: elevations,
      })
      .groupBy('filename')
      .orderBy('filename')
      .getRawMany<AggregatedMapping>();

    const results = [];
    for (const fileMapping of fileMappings) {
      const data = await this.queryRaster(queryPoints, fileMapping.filename, pool);
      results.push({ time: fileMapping.times, data, elevations: fileMapping.elevations });
    }
    return results;
  }

  async queryGfsData(query: RouteProfileQueryDto) {
    const gfsHumidity = await this.queryRasterDataset(query.queryPoints, this.humidityRepository);
    const gfsTemperature = await this.queryRasterDataset(query.queryPoints, this.temperaturRepository);
    const gfsWindDirection = await this.queryRasterDatasetByElevations(
      query.queryPoints,
      query.elevations,
      this.gfsWindDirectionRepository,
    );
    const gfsWindSpeed = await this.queryRasterDatasetByElevations(
      query.queryPoints,
      query.elevations,
      this.gfsWindSpeedRepository,
    );
    return {
      humidity: gfsHumidity,
      temperature: gfsTemperature,
      windDirection: gfsWindDirection,
      windSpeed: gfsWindSpeed,
    };
  }

  async queryIcingTurbData(query: RouteProfileQueryDto) {
    const sld = await this.queryRasterDataset(query.queryPoints, this.icingSldRepository);
    const sev = await this.queryRasterDataset(query.queryPoints, this.icingSevRepository);
    const prob = await this.queryRasterDataset(query.queryPoints, this.icingProbRepository);
    const cat = await this.queryRasterDataset(query.queryPoints, this.clearAirTubRepository);
    const mwt = await this.queryRasterDataset(query.queryPoints, this.mwturbRepository);
    return { sld, sev, prob, cat, mwt };
  }

  async queryAllNbmValues(query: RouteProfileQueryDto) {
    const cloudbase = await this.queryRasterDataset(query.queryPoints, this.nbmCloudBaseRepository);
    const dewpoint = await this.queryRasterDataset(query.queryPoints, this.nbmDewpointRepository);
    const gust = await this.queryRasterDataset(query.queryPoints, this.nbmGustRepository);
    const skycover = await this.queryRasterDataset(query.queryPoints, this.nbmSkycoverRepository);
    const temperature = await this.queryRasterDataset(query.queryPoints, this.nbmT2mRepository);
    const winddir = await this.queryRasterDataset(query.queryPoints, this.nbmWindDirectionRepository);
    const windspeed = await this.queryRasterDataset(query.queryPoints, this.nbmWindSpeedRepository);
    return { cloudbase, dewpoint, gust, skycover, temperature, winddir, windspeed };
  }

  async query4DepartureAdvisor(query: RouteProfileQueryDto) {
    // turbulences
    const cat = await this.queryRasterDatasetByElevations(
      query.queryPoints,
      query.elevations,
      this.clearAirTubRepository,
    );
    const mwt = await this.queryRasterDatasetByElevations(query.queryPoints, query.elevations, this.mwturbRepository);
    // Icings
    const prob = await this.queryRasterDatasetByElevations(
      query.queryPoints,
      query.elevations,
      this.icingProbRepository,
    );
    const severity = await this.queryRasterDatasetByElevations(
      query.queryPoints,
      query.elevations,
      this.icingSevRepository,
    );
    const gWindDir = await this.queryRasterDatasetByElevations(
      query.queryPoints,
      query.elevations,
      this.gfsWindDirectionRepository,
    );
    const gWindSpeed = await this.queryRasterDatasetByElevations(
      query.queryPoints,
      query.elevations,
      this.gfsWindSpeedRepository,
    );
    // const sld = await this.queryRasterDataset(query.queryPoints, this.icingSldRepository);
    // nbms
    const cloudceiling = await this.queryRasterDataset(query.queryPoints, this.nbmCloudCeilingRepository);
    const visibility = await this.queryRasterDataset(query.queryPoints, this.nbmVisRepository);
    const wx_1 = await this.queryRasterDataset(query.queryPoints, this.nbmWx1Repository);
    const wx_2 = await this.queryRasterDataset(query.queryPoints, this.nbmWx2Repository);
    const wxInten1 = await this.queryRasterDataset(query.queryPoints, this.nbmWxInten1Repository);
    const wxInten2 = await this.queryRasterDataset(query.queryPoints, this.nbmWxInten2Repository);
    const wxProbCov1 = await this.queryRasterDataset(query.queryPoints, this.nbmWxProbCov1Repository);
    const wxProbCov2 = await this.queryRasterDataset(query.queryPoints, this.nbmWxProbCov2Repository);
    return {
      cat,
      mwt,
      prob,
      severity,
      cloudceiling,
      visibility,
      wx_1,
      wx_2,
      wxInten1,
      wxInten2,
      wxProbCov1,
      wxProbCov2,
      gWindDir,
      gWindSpeed,
    };
  }

  async queryAirportNbm(faaids: string[]) {
    const result = [];
    const timeTables = await this.dataSource
      .createQueryBuilder()
      .select(['fcst_hr_stat_map.station_table_name AS table', 'fcst_hr_stat_map.valid_date AS time'])
      .from('fcst_hr_stat_map', null)
      .getRawMany();
    for (const timeTable of timeTables) {
      const rows = await this.dataSource
        .createQueryBuilder()
        .select([
          'faaid',
          'icaoid',
          'temp_c',
          'dewp_c',
          'skycov',
          'w_speed',
          'w_dir',
          'w_gust',
          'vis',
          'ceil',
          'l_cloud',
          'cross_r_id',
          'cross_com',
          'wx_1',
          'wx_2',
          'wx_3',
          'wx_prob_cov_1',
          'wx_prob_cov_2',
          'wx_prob_cov_3',
          'wx_inten_1',
          'wx_inten_2',
          'wx_inten_3',
        ])
        .from(`${timeTable.table}`, null)
        .where(`${timeTable.table}.faaid IN (:...faaids)`, { faaids: faaids })
        .orWhere(`${timeTable.table}.icaoid IN (:...faaids)`, { faaids: faaids })
        .getRawMany();
      result.push({ time: timeTable.time, data: rows });
    }
    return result;
  }

  async queryLastDepartureDataTime() {
    const greatest = await this.dataSource
      .createQueryBuilder()
      .select(['least(max(gfs_windspeed_mapping.time), max(nbm_cloudceiling.time))'])
      .from('gfs_windspeed_mapping', null)
      .from('nbm_cloudceiling', null)
      .getRawMany();

    return greatest;
  }
}
