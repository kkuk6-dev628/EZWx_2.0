import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto, AuthSingingDto } from './dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { TypeORMError } from 'typeorm';
import { JwtAuthService } from './jwt/jwt-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtAuthService,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await bcrypt.hash(dto.password, 2);

    try {
      const user = await this.userService.create({
        username: dto.username,
        hash,
        email: dto.email,
      });

      const accessToken = await this.jwtService.login({
        id: user.id,
        email: user.email,
      });

      return {
        access_token: accessToken,
      };
    } catch (err) {
      if (err instanceof TypeORMError) {
        if (/(duplicate key)[\s\S]/.test(err.message)) {
          throw new ForbiddenException('email is already exists..');
        }
      }
    }
  }

  async signin(dto: AuthSingingDto) {
    const user = await this.userService.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('email or password incorrect');

    const pwMatches = await bcrypt.compare(dto.password, user.hash);

    if (!pwMatches) throw new ForbiddenException('email or password incorrect');

    const accessToken = await this.jwtService.login({
      id: user.id,
      email: user.email,
    });

    return {
      access_token: accessToken,
    };
  }
}
