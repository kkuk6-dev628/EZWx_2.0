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

  async create(dto: CreateUserDto) {
    const { certifications, ...user } = dto;

    const mapcertifications = certifications.map((certificate) =>
      this.certificationsRepository.create(certificate),
    );

    const newUser = this.userRepository.create(user);
    newUser.displayName = user.firstname + ' ' + user.lastname;
    newUser.certifications = mapcertifications;

    return await this.userRepository.save(newUser);
  }

  async findOne(params: FindOneOptions<User> = {}) {
    return await this.userRepository.findOne(params);
  }

  async findAll(params: FindManyOptions<User> = {}) {
    return await this.userRepository.find(params);
  }

  async update(id: any, updateUser: any) {
    const findUser = await this.userRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        certifications: true,
      },
    });

    if (findUser !== undefined) {
      for (const key in updateUser) {
        findUser[key] = updateUser[key];
      }

      return await this.userRepository.save(findUser);
    } else {
      return "user doesn't exists";
    }
  }
}
