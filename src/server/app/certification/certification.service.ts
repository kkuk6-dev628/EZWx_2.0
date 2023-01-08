import { Injectable } from '@nestjs/common';
import { Certification } from './certification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCertificationDto } from './dto/create-certification.dto';

@Injectable()
export class CertificationService {
  constructor(
    @InjectRepository(Certification)
    private certificationRepository: Repository<Certification>,
  ) {}

  async create(dto: CreateCertificationDto) {
    const repoCertification = this.certificationRepository.create(dto);
    repoCertification.name = dto.name;
    repoCertification.description = dto.description;

    try {
      const newCertification = await this.certificationRepository.save(
        repoCertification,
      );
      return newCertification;
    } catch (err: any) {
      console.log(err.message);
    }
  }
}
