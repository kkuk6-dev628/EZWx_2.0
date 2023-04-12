import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ClearAirTurb } from './route-profile.gisdb-entity';
import { RouteProfileQueryDto } from './route-profile-query.dto';
import { dynamicImport } from 'tsimportlib';

const rasterDataDir = '/usr/share/geoserver/data_dir/data/EZWxBrief';
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

    const clearAirTurbFileTimes = await this.clearAirTubRepository.find();
    const fileNames = [
      '2t_20230411T140000.tif',
      '2t_20230411T150000.tif',
      '2t_20230411T160000.tif',
      '2t_20230411T170000.tif',
      '2t_20230411T180000.tif',
      '2t_20230411T190000.tif',
      '2t_20230411T200000.tif',
      '2t_20230411T210000.tif',
      '2t_20230411T220000.tif',
      '2t_20230411T230000.tif',
      '2t_20230412T000000.tif',
      '2t_20230412T010000.tif',
      '2t_20230412T020000.tif',
      '2t_20230412T030000.tif',
      '2t_20230412T040000.tif',
      '2t_20230412T050000.tif',
      '2t_20230412T060000.tif',
      '2t_20230412T070000.tif',
    ];
    const results = [];
    console.log('start', new Date().toLocaleTimeString());
    for (const filename of fileNames) {
      const filePath = rasterDataDir + filename;
      const data = await this.queryRaster(query.queryPoints, filePath, pool);
      results.push(data);
      console.log(filename, new Date().toLocaleTimeString());
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
