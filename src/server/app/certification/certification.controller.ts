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

  // @Get('findall')
  // findAll() {}
}
