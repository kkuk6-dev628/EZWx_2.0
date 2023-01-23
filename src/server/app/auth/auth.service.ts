import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthSignupDto, AuthSinginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { TypeORMError } from 'typeorm';
import { JwtAuthService } from './jwt/jwt-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtAuthService,
  ) {}

  async signup(dto: AuthSignupDto) {
    const hash = await bcrypt.hash(dto.password, 2);

    const { password, confirmPassword, ...newDto } = dto;

    try {
      const user = await this.userService.create({
        hash,
        ...newDto,
      });

      const accessToken = await this.jwtService.login({
        id: user.id,
        email: user.email,
      });

      return {
        access_token: accessToken,
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      };
    } catch (err) {
      if (err instanceof TypeORMError) {
        if (/(duplicate key)[\s\S]/.test(err.message)) {
          throw new BadRequestException('email is already exists');
        }
      }
    }
  }

  async signin(dto: AuthSinginDto): Promise<{
    access_token: string;
    id: number;
    email: string;
    displayName: string;
  }> {
    const user = await this.userService.findOne({
      where: {
        email: dto.email,
      },
    });

    console.log('user is ', user.displayName);

    if (!user) throw new ForbiddenException('email or password incorrect');

    const pwMatches = await bcrypt.compare(dto.password, user.hash);

    if (!pwMatches) throw new ForbiddenException('email or password incorrect');

    const accessToken = await this.jwtService.login({
      id: user.id,
      email: user.email,
    });

    return {
      access_token: accessToken,
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }
}
