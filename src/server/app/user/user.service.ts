import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { Certification } from '../certification/certification.entity';
import { SavedItem } from '../api/favorites/saved.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Certification)
    private certificationsRepository: Repository<Certification>,
    @InjectRepository(SavedItem)
    private favoriteItemRepository: Repository<SavedItem>,
  ) {}

  async createFavoritesDefaultFolder(text: string, userId: number) {
    const item = this.favoriteItemRepository.create({
      text,
      userId,
      parent: 1,
      selected: false,
      droppable: true,
      data: `{ type: 'folder', data: null }`,
    });
    return await this.favoriteItemRepository.save(item);
  }

  async create(dto: CreateUserDto) {
    const { certifications, ...user } = dto;

    const mapcertifications = certifications.map((certificate) => this.certificationsRepository.create(certificate));

    const newUser = this.userRepository.create(user);
    newUser.displayName = user.firstname + ' ' + user.lastname;
    newUser.certifications = mapcertifications;

    const savedUser = await this.userRepository.save(newUser);
    if (savedUser.id) {
      this.createFavoritesDefaultFolder('My Routes', savedUser.id);
      this.createFavoritesDefaultFolder('My Imagery', savedUser.id);
      this.createFavoritesDefaultFolder('My Airports', savedUser.id);
    }
    return savedUser;
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
