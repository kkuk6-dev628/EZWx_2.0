import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ClearAirTurb } from './route-profile.gisdb-entity';
import { RouteProfileQueryDto } from './route-profile-query.dto';
import { dynamicImport } from 'tsimportlib';

const rasterDataDir = '/usr/share/geoserver/data_dir/data/EZWxBrief';

@Injectable()
export class RouteProfileQueryDataService {
  constructor(
    @InjectRepository(ClearAirTurb, 'gisDB')
    private clearAirTubRepository: Repository<ClearAirTurb>,
  ) {}

  async findAll(query: RouteProfileQueryDto) {
    const clearAirTurbFileTimes = await this.clearAirTubRepository.find();
    const results = [];
    clearAirTurbFileTimes.forEach((clearAirTurbFileTime) => {
      const filePath = rasterDataDir + '/cat/' + clearAirTurbFileTime.location;
      const data = this.queryRaster(query.queryPoints, filePath);
      results.push({ time: clearAirTurbFileTime.ingestion, elevation: clearAirTurbFileTime.elevation, ...data });
    });

    return results;
  }

  async queryRaster(positions: GeoJSON.Position[], rasterFileName: string) {
    const geotiff = (await dynamicImport('geotiff', module)) as typeof import('geotiff');
    const file = await geotiff.fromFile(rasterFileName);
    const image = await file.getImage();
    const bbox = image.getBoundingBox();
    const pixelWidth = image.getWidth();
    const pixelHeight = image.getHeight();
    const bboxWidth = bbox[2] - bbox[0];
    const bboxHeight = bbox[3] - bbox[1];
    const lngResolution = bboxWidth / pixelWidth;
    const results = [];
    positions.forEach(async (position) => {
      const widthPct = (position[0] - bbox[0]) / bboxWidth;
      const heightPct = (position[1] - bbox[1]) / bboxHeight;
      const xPx = Math.floor(pixelWidth * widthPct);
      const yPx = Math.floor(pixelHeight * (1 - heightPct));
      const window = [xPx, yPx, xPx + 1, yPx + 1];
      const data = await image.readRasters({ window });
      results.push({ position, data });
    });
    return results;
  }
}
