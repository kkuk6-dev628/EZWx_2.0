import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { dynamicImport } from 'tsimportlib';
import { RoutePointsDto } from './dto';

@Controller('api')
export class ApiController {
  @Post('/queryraster')
  async api(@Body() routePointsDto: RoutePointsDto) {
    const geotiff = (await dynamicImport(
      'geotiff',
      module,
    )) as typeof import('geotiff');
    const file = await geotiff.fromFile('D:\\EZWx\\2t_NBM.tif');
    const image = await file.getImage();
    const bbox = image.getBoundingBox();
    const pixelWidth = image.getWidth();
    const pixelHeight = image.getHeight();
    const bboxWidth = bbox[2] - bbox[0];
    const bboxHeight = bbox[3] - bbox[1];
    const widthPct = (routePointsDto.lng - bbox[0]) / bboxWidth;
    const heightPct = (routePointsDto.lat - bbox[1]) / bboxHeight;
    const xPx = Math.floor(pixelWidth * widthPct);
    const yPx = Math.floor(pixelHeight * (1 - heightPct));
    const window = [xPx, yPx, xPx + 200, yPx + 1];
    const data = await image.readRasters({ window });
    return data;
  }
}
