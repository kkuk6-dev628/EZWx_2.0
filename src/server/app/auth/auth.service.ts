import { BadRequestException, ForbiddenException, Injectable, Req, Res } from '@nestjs/common';
import { AuthSignupDto, AuthSinginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { TypeORMError } from 'typeorm';
import { JwtAuthService } from './jwt/jwt-auth.service';
import { MailService } from '../mail/mail.service';
import { ViewService } from 'src/server/view/view.service';
import { parse } from 'url';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtAuthService,
    private mailService: MailService,
    private viewService: ViewService,
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
        ...user,
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

    console.log('user is ', user ? user.displayName : 'none');

    if (!user) throw new ForbiddenException('Email incorrect!');

    const pwMatches = await bcrypt.compare(dto.password, user.hash);

    if (!pwMatches) throw new ForbiddenException('Password incorrect!');

    const accessToken = await this.jwtService.login({
      id: user.id,
      email: user.email,
    });

    return {
      access_token: accessToken,
      ...user,
    };
  }
  async getUser(userid): Promise<{ id: number; email: string; displayName: string }> {
    const user = await this.userService.findOne({
      where: {
        id: userid,
      },
      relations: {
        certifications: true,
      },
    });

    if (!user) throw new ForbiddenException('User id incorrect! ' + userid);

    return user;
  }

  async resetPasswordStart(host: string, email) {
    const user = await this.userService.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      const token = await this.userService.createToken(user);
      return this.mailService.sendResetPasswordMail(host, user, token);
    } else {
      return false;
    }
  }

  async updatePassword(dto: AuthSinginDto) {
    if (dto.newPassword) {
      const user = await this.userService.findOne({
        where: {
          email: dto.email,
        },
      });
      if (!user) throw new ForbiddenException('Email incorrect!');

      const pwMatches = await bcrypt.compare(dto.password, user.hash);

      if (!pwMatches) throw new ForbiddenException('Password incorrect!');
      const hash = await bcrypt.hash(dto.newPassword, 2);
      const res = await this.userService.updatePassword(dto.email, hash);
      return res.affected;
    } else {
      const hash = await bcrypt.hash(dto.password, 2);
      const user = await this.userService.updatePassword(dto.email, hash);
      return user.affected;
    }
  }
}
