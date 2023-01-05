import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { Certification } from '../certification/certification.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Certification)
    private certificationsRepository: Repository<Certification>,
  ) {}

  create(dto: CreateUserDto) {
    const { certifications, ...user } = dto;

    const mapcertificationss = certifications.map((certificate) =>
      this.certificationsRepository.create(certificate),
    );

    const newUser = this.userRepository.create(user);
    newUser.certifications = mapcertificationss;

    console.log('newUser is ', newUser);

    return this.userRepository.save(newUser);
  }

  findOne(params: FindOneOptions<User> = {}) {
    return this.userRepository.findOne(params);
  }

  findAll(params: FindManyOptions<User> = {}) {
    return this.userRepository.find(params);
  }
}
