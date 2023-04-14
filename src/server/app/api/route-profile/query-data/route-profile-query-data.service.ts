import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AggregatedMapping,
  ClearAirTurb,
  GfsHumidity,
  GfsTemperature,
  GfsWindDirection,
  GfsWindSpeed,
  Mwturb,
} from './route-profile.gisdb-entity';
import { RouteProfileQueryDto } from './route-profile-query.dto';
import { dynamicImport } from 'tsimportlib';

const rasterDataDir = '/data/ingest/GTG/Data';
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

  async queryRasterDataset(queryPoints: GeoJSON.Position[], repository: Repository<any>, folderName: string) {
    if (!geotiff) {
      geotiff = (await dynamicImport('geotiff', module)) as typeof import('geotiff');
    }
    if (!pool) pool = new geotiff.Pool();

    const fileMappings = await repository
      .createQueryBuilder()
      .select(['filename', 'array_agg (band) as bands', 'array_agg (elevation) elevations'])
      .groupBy('filename')
      .getRawMany<AggregatedMapping>();

    const results = [];
    for (const fileMapping of fileMappings) {
      const filePath = rasterDataDir + '/' + folderName + '/' + fileMapping.filename;
      const data = await this.queryRaster(queryPoints, filePath, pool);
      results.push(data);
    }
    return results;
  }

  async queryCat(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.clearAirTubRepository, 'cat');
  }

  async queryMwturb(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.mwturbRepository, 'mwturb');
  }

  async queryHumidity(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.humidityRepository, 'gfs_humidity');
  }

  async queryTemperature(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.temperaturRepository, 'gfs_temperature');
  }

  async queryGfsWindDirection(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.gfsWindDirectionRepository, 'gfs_winddirection');
  }

  async queryGfsWindSpeed(query: RouteProfileQueryDto) {
    return await this.queryRasterDataset(query.queryPoints, this.gfsWindSpeedRepository, 'gfs_windspeed');
  }
}
