import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignupDto, AuthSinginDto } from './dto';
import { ValidationPipe } from '@nestjs/common';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body(new ValidationPipe()) dto: AuthSignupDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  signin(@Body(new ValidationPipe()) dto: AuthSinginDto) {
    return this.authService.signin(dto);
  }
}
