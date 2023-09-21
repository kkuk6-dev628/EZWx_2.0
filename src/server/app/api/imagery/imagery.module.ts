import { Module } from '@nestjs/common';
import { ImageryController } from './imagery.controller';
import { ImageryService } from './imagery.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Imagery } from './imagery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Imagery]), HttpModule],
  controllers: [ImageryController],
  providers: [ImageryService],
})
export class ImageryModule {}
