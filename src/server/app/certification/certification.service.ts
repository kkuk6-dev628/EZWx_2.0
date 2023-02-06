import { BadRequestException, Injectable } from '@nestjs/common';
import { Certification } from './certification.entity';
import { FindManyOptions, Repository } from 'typeorm';
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
      const newCertification = await this.certificationRepository.save(repoCertification);
      return newCertification;
    } catch (err: any) {
      console.log(err.message);
    }
  }

  async createAll(dto: CreateCertificationDto[]) {
    try {
      await this.certificationRepository.save(dto);

      return {
        statusCode: 201,
        message: 'Successfully Certification Create',
      };
    } catch (err: any) {
      console.log('main error ', err);
      console.log(err.message);
      throw new BadRequestException(err.message);
    }
  }

  async findAll(params: FindManyOptions<Certification> = {}) {
    const certifications = await this.certificationRepository.find(params);
    return certifications;
  }
}
