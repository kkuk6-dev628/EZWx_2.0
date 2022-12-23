import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-auth.strategy';

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: JwtService) {}

  login(user: { email: string; id: number }) {
    const payload: JwtPayload = { email: user.email, sub: user.id };
    return this.jwtService.signAsync(payload);
  }
}
