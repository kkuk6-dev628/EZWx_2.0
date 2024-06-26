import { Body, Controller, Get, Post } from '@nestjs/common';
import { CertificationService } from './certification.service';
import { CreateCertificationDto } from './dto/create-certification.dto';

@Controller('certification')
export class CertificationController {
  constructor(private certificationService: CertificationService) {}

  @Post('create')
  create(@Body() dto: CreateCertificationDto) {
    return this.certificationService.create(dto);
  }

  @Post('createAll')
  createAll(@Body() dto: CreateCertificationDto[]) {
    return this.certificationService.createAll(dto);
  }

  @Get('findAll')
  findAll() {
    return this.certificationService.findAll({});
  }
}
