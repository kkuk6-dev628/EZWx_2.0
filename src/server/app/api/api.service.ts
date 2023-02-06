import { Injectable } from '@nestjs/common';
import { dynamicImport } from 'tsimportlib';
import { RoutePointsDto } from './dto';

@Injectable()
export class ApiService {
  async queryRaster(routePointsDto: RoutePointsDto) {
    const geotiff = (await dynamicImport('geotiff', module)) as typeof import('geotiff');
    const file = await geotiff.fromFile('/home/tuan/model_data/NBM/2t_NBM.tif');
    const image = await file.getImage();
    const bbox = image.getBoundingBox();
    const pixelWidth = image.getWidth();
    const pixelHeight = image.getHeight();
    const bboxWidth = bbox[2] - bbox[0];
    const bboxHeight = bbox[3] - bbox[1];
    const lngResolution = bboxWidth / pixelWidth;
    const widthPct = (routePointsDto.lng - bbox[0]) / bboxWidth;
    const heightPct = (routePointsDto.lat - bbox[1]) / bboxHeight;
    const xPx = Math.floor(pixelWidth * widthPct);
    const yPx = Math.floor(pixelHeight * (1 - heightPct));
    const window = [xPx, yPx, xPx + 200, yPx + 1];
    const data = await image.readRasters({ window });
    const results = {};
    let lng = routePointsDto.lng;
    (data[0] as any).forEach((value) => {
      results[`${Math.ceil(lng * 10000) / 10000}, ${Math.ceil(routePointsDto.lat * 10000) / 10000}`] =
        Math.ceil(value * 1000) / 1000;
      lng += lngResolution;
    });
    return results;
  }
}
