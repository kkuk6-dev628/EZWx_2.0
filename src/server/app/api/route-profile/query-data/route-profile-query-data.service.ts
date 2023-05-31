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

  async queryCat(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.clearAirTubRepository);
  }

  async queryMwturb(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.mwturbRepository);
  }

  async queryHumidity(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.humidityRepository);
  }

  async queryTemperature(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.temperaturRepository);
  }

  async queryGfsWindDirection(query: RouteProfileQueryDto) {
    // const result = await this.queryRasterDataset(query.queryPoints, this.gfsWindDirectionRepository);
    const result = await this.queryRasterDatasetByElevations(
      query.queryPoints,
      query.elevations,
      this.gfsWindDirectionRepository,
    );
    return result;
  }

  async queryGfsWindSpeed(query: RouteProfileQueryDto) {
    return await this.queryRasterDatasetByElevations(query.queryPoints, query.elevations, this.gfsWindSpeedRepository);
    // return await this.queryRasterDataset(query.queryPoints, this.gfsWindSpeedRepository);
  }

  async queryIcingProb(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.icingProbRepository);
  }

  async queryIcingSev(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.icingSevRepository);
  }

  async queryIcingSld(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.icingSldRepository);
  }

  async queryNbmCloudbase(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.nbmCloudBaseRepository);
  }

  async queryNbmCloudceiling(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.nbmCloudCeilingRepository);
  }

  async queryNbmDewpoint(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.nbmDewpointRepository);
  }

  async queryNbmGust(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.nbmGustRepository);
  }

  async queryNbmSkycover(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.nbmSkycoverRepository);
  }

  async queryNbmT2m(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.nbmT2mRepository);
  }

  async queryNbmVis(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.nbmVisRepository);
  }

  async queryNbmWindDirection(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.nbmWindDirectionRepository);
  }

  async queryNbmWindSpeed(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.nbmWindSpeedRepository);
  }

  async queryNbmWx1(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.nbmWx1Repository);
  }

  async queryAllNbmValues(query: RouteProfileQueryDto) {
    const cloudbase = await this.queryRasterDataset(query.queryPoints, this.nbmCloudBaseRepository);
    const cloudceiling = await this.queryRasterDataset(query.queryPoints, this.nbmCloudCeilingRepository);
    const dewpoint = await this.queryRasterDataset(query.queryPoints, this.nbmDewpointRepository);
    const gust = await this.queryRasterDataset(query.queryPoints, this.nbmGustRepository);
    const skycover = await this.queryRasterDataset(query.queryPoints, this.nbmSkycoverRepository);
    const temperature = await this.queryRasterDataset(query.queryPoints, this.nbmT2mRepository);
    const visibility = await this.queryRasterDataset(query.queryPoints, this.nbmVisRepository);
    const winddir = await this.queryRasterDataset(query.queryPoints, this.nbmWindDirectionRepository);
    const windspeed = await this.queryRasterDataset(query.queryPoints, this.nbmWindSpeedRepository);
    return { cloudbase, cloudceiling, dewpoint, gust, skycover, temperature, visibility, winddir, windspeed };
  }

  async queryFlightCategory(query: RouteProfileQueryDto) {
    const cloudbase = await this.queryRasterDataset(query.queryPoints, this.nbmCloudBaseRepository);
    const skycover = await this.queryRasterDataset(query.queryPoints, this.nbmSkycoverRepository);
    return { cloudbase, skycover };
  }

  async queryIcingAll(query: RouteProfileQueryDto) {
    const prob = await this.queryRasterDataset(query.queryPoints, this.icingProbRepository);
    const severity = await this.queryRasterDataset(query.queryPoints, this.icingSevRepository);
    return { prob, severity };
  }

  async query4DepartureAdvisor(query: RouteProfileQueryDto) {
    const cat = await this.queryRasterDatasetByElevations(
      query.queryPoints,
      query.elevations,
      this.clearAirTubRepository,
    );
    const mwt = await this.queryRasterDatasetByElevations(query.queryPoints, query.elevations, this.mwturbRepository);
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
    const cloudceiling = await this.queryRasterDataset(query.queryPoints, this.nbmCloudCeilingRepository);
    const visibility = await this.queryRasterDataset(query.queryPoints, this.nbmVisRepository);
    return { cat, mwt, prob, severity, cloudceiling, visibility };
  }

  async queryAirportNbm(query: { faaids: string }) {
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
        .where(`${timeTable.table}.faaid IN (:...faaids)`, { faaids: query.faaids.split(',') })
        .orWhere(`${timeTable.table}.icaoid IN (:...faaids)`, { faaids: query.faaids.split(',') })
        .getRawMany();
      result.push({ time: timeTable.time, data: rows });
    }
    return result;
  }
}
