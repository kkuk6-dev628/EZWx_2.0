import { Module } from '@nestjs/common';
import { CertificationController } from './certification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certification } from './certification.entity';
import { CertificationService } from './certification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Certification])],
  controllers: [CertificationController],
  providers: [CertificationService],
})
export class CertificationModule {}
