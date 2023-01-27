import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Certification } from './certification.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCertificationDto } from './dto/create-certification.dto';
import * as fs from 'fs';
import { join } from 'path';
@Injectable()
export class CertificationService implements OnModuleInit {
  constructor(
    @InjectRepository(Certification)
    private certificationRepository: Repository<Certification>,
  ) {}

  async readJSON() {
    return new Promise((resolve, reject) => {
      fs.readFile(
        join(__dirname, './data/certification.data.json'),
        'utf8',
        (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(JSON.parse(data));
        },
      );
    });
  }

  async onModuleInit() {
    const data: any = await this.readJSON();
    // console.log('json data is ', data);
    await this.createAll(data);
  }

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
