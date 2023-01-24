import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignupDto, AuthSinginDto } from './dto';
import { ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body(new ValidationPipe()) dto: AuthSignupDto,
    @Res() res: Response,
  ) {
    const { access_token, id, email, displayName } =
      await this.authService.signup(dto);
    res
      .cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
      .status(HttpStatus.OK)
      .json({ message: 'Signup successfully 😊 👌', id, email, displayName });
  }

  @Post('signin')
  async signin(
    @Body(new ValidationPipe()) dto: AuthSinginDto,
    @Res() res: Response,
  ) {
    const { access_token, id, email, displayName } =
      await this.authService.signin(dto);
    res
      .cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
      .status(HttpStatus.OK)
      .json({
        message: 'Logged in successfully 😊 👌',
        id,
        email,
        displayName,
      });
  }

  @Get('signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signout(@Res() res: Response) {
    res.clearCookie('access_token', { httpOnly: true });
    res.send({ message: 'Signout Successful' });
  }
}
