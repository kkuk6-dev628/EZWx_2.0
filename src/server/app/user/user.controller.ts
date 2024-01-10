import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('findOne')
  async findOne(@Query() query: any) {
    console.log('query is ', query);
    const user = await this.userService.findOne({
      where: {
        id: query.id,
      },
      relations: {
        certifications: true,
      },
    });

    delete user.hash;
    return user;
  }

  @Get('find')
  async find(@Query() query: any) {
    console.log('query is ', query);
    const user = await this.userService.findOne({
      where: {
        email: query.email,
      },
    });
    return user ? true : false;
  }

  @Put('update/:id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.userService.update(id, updateUserDto);
  }
}
