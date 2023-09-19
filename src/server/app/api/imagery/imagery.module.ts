import { Module } from '@nestjs/common';
import { ImageryController } from './imagery.controller';
import { ImageryService } from './imagery.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ImageryController],
  providers: [ImageryService],
})
export class ImageryModule {}
