import { Resolver, Query } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { FindManyOptions } from 'typeorm';
import { User } from './user.entity';

@Resolver((_of) => User)
export class UsersResolver {
  constructor(@Inject(UsersService) private usersService: UsersService) {}

  @Query((_returns) => [User])
  async users(params: FindManyOptions<User> = {}): Promise<User[]> {
    return this.usersService.findAll(params);
  }

  // @Query((_returns) => User)
  // @UseGuards(GqlAuthGuard)
  // whoAmI(@CurrentUser() user: User) {
  //   return this.usersService.findOne({ where: { id: user.id } });
  // }
}
