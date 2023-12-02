import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certification } from '../certification/certification.entity';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FavoriteItem } from '../api/favorites/favorites.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Certification, FavoriteItem])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
