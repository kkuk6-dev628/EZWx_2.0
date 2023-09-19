import { Controller, Get, Query } from '@nestjs/common';
import { ImageryService } from './imagery.service';

@Controller('api/imagery')
export class ImageryController {
  constructor(private imageryService: ImageryService) {}

  @Get('timestamps')
  getTimeStamp(@Query() query) {
    return this.imageryService.getTimeStamp(query.url);
  }
}
