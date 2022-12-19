import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(dto: AuthDto) {
    const hash = await bcrypt.hash(dto.password, 2);

    const user = await this.userService.create({
      username: dto.username,
      hash,
      email: dto.email,
    });
    return user;
  }

  signin() {
    return 'hello from signin';
  }
}
