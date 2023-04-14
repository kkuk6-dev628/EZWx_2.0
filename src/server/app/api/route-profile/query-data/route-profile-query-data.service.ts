import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AggregatedMapping, ClearAirTurb } from './route-profile.gisdb-entity';
import { RouteProfileQueryDto } from './route-profile-query.dto';
import { dynamicImport } from 'tsimportlib';

const rasterDataDir = '/data/ingest/GTG/Data';
let geotiff;

@Injectable()
export class RouteProfileQueryDataService {
  constructor(
    @InjectRepository(ClearAirTurb, 'gisDB')
    private clearAirTubRepository: Repository<ClearAirTurb>,
  ) {}

  async queryCat(query: RouteProfileQueryDto) {
    if (!geotiff) {
      geotiff = (await dynamicImport('geotiff', module)) as typeof import('geotiff');
    }
    const pool = new geotiff.Pool();

    const clearAirTurbFileTimes = await this.clearAirTubRepository
      .createQueryBuilder()
      .select(['filename', 'array_agg (band) as bands', 'array_agg (elevation) elevations'])
      .groupBy('filename')
      .getRawMany<AggregatedMapping>();

    const results = [];
    for (const clearAirTurbFileTime of clearAirTurbFileTimes) {
      const filePath = rasterDataDir + '/cat_mapping/' + clearAirTurbFileTime.filename;
      const data = await this.queryRaster(query.queryPoints, filePath, pool);
      results.push(data);
      console.log(clearAirTurbFileTime.filename, new Date().toLocaleTimeString());
    }
    return results;
  }

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
}
